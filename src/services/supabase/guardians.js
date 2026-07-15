import { supabase } from "./client.js";

// PDAO staff: create a guardian login account and link it to a PWD ward.
// `payload` = { pwdId, lastName, firstName, middleName, relationship }.
// Returns { result: { email, password, guardianId }, error }.
export async function createGuardian(payload) {
  const { data, error } = await supabase.functions.invoke("create-guardian", {
    body: payload,
  });
  if (error) {
    let message = error.message;
    try {
      const body = await error.context?.json?.();
      if (body?.error) message = body.error;
    } catch {
      // keep generic message
    }
    return { result: null, error: { message } };
  }
  return { result: data, error: null };
}

// Reassign a ward (PWD) to a replacement guardian so its current guardian can
// be deleted. `mode: "existing"` links an existing guardian account; `mode:
// "new"` creates a fresh guardian via the create-guardian edge function. Either
// way the ward ends up linked to another guardian (the old link stays for
// restore and is hidden once the old guardian is soft-deleted).
// `{ pwdId, mode, guardian?, newGuardian? }` -> `{ error }`.
export async function reassignWard({ pwdId, mode, guardian, newGuardian }) {
  if (mode === "new") {
    // createGuardian returns { email, password, guardianId } — surface it so the
    // caller can show the new guardian's temporary login.
    const { result, error } = await createGuardian({ pwdId, ...newGuardian });
    return { error, created: result };
  }
  // existing: PDAO has RLS write on guardian_ward_links, so link directly.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("guardian_ward_links").upsert(
    {
      guardian_id: guardian.guardianId,
      pwd_id: pwdId,
      guardian_name: guardian.name ?? null,
      guardian_email: guardian.email ?? null,
      guardian_phone: guardian.phone ?? null,
      guardian_active: true,
      created_by: user?.id ?? null,
    },
    { onConflict: "guardian_id,pwd_id", ignoreDuplicates: true }
  );
  return { error, created: null };
}

// Guardian: dismiss (or undo) a deleted ward from their own dashboard view.
export async function dismissDeletedWard(linkId, undo = false) {
  const { data, error } = await supabase.functions.invoke("dismiss-ward", {
    body: { linkId, undo },
  });
  if (error) return { ok: false, error };
  return { ok: Boolean(data?.ok), error: null };
}

// Digits-only form of a phone number, so "0917 123 4567" and "09171234567"
// compare equal.
const phoneKey = (v) => (v || "").replace(/\D/g, "");

// PDAO staff: find existing guardian accounts that likely match the guardian
// named on an application, so a new ward can be linked to an account that
// already exists instead of creating a duplicate. Matches on phone first
// (reliable) and falls back to an exact name match. Returns deduped candidates
// (one per guardian account) with the number of wards each already has.
// `{ phone, name }` -> `{ matches: [{ guardianId, name, email, phone, wardCount }], error }`.
export async function findGuardianMatches({ phone, name } = {}) {
  const key = phoneKey(phone);
  const trimmedName = (name || "").trim();
  if (!key && !trimmedName) return { matches: [], error: null };

  const { data, error } = await supabase
    .from("guardian_ward_links")
    .select("guardian_id, guardian_name, guardian_email, guardian_phone")
    .is("removed_at", null);
  if (error) return { matches: [], error };

  const byGuardian = new Map();
  for (const row of data ?? []) {
    const phoneHit = key && phoneKey(row.guardian_phone) === key;
    const nameHit =
      trimmedName &&
      (row.guardian_name || "").trim().toLowerCase() ===
        trimmedName.toLowerCase();
    if (!phoneHit && !nameHit) continue;

    const existing = byGuardian.get(row.guardian_id);
    if (existing) {
      existing.wardCount += 1;
      existing.phoneHit = existing.phoneHit || phoneHit;
    } else {
      byGuardian.set(row.guardian_id, {
        guardianId: row.guardian_id,
        name: row.guardian_name,
        email: row.guardian_email,
        phone: row.guardian_phone,
        wardCount: 1,
        phoneHit,
      });
    }
  }

  // Phone matches first (strongest signal), then name-only matches.
  const matches = [...byGuardian.values()].sort(
    (a, b) => Number(b.phoneHit) - Number(a.phoneHit)
  );
  return { matches, error: null };
}

// PDAO staff: list every guardian account, each with the wards it is linked to.
// Rows in guardian_ward_links are grouped by guardian so one guardian with
// several wards appears once. Returns
// `{ guardians: [{ guardianId, name, email, phone, wards: [...] }], error }`.
export async function getAllGuardians() {
  const { data, error } = await supabase
    .from("guardian_ward_links")
    .select(
      "id, guardian_id, guardian_name, guardian_email, guardian_phone, guardian_active, relationship, created_at, ward:pwd_id(id, full_name, pwd_id_number, barangay, active)"
    )
    .is("removed_at", null)
    .order("created_at", { ascending: true });
  if (error) return { guardians: [], error };

  const byGuardian = new Map();
  for (const row of data ?? []) {
    let g = byGuardian.get(row.guardian_id);
    if (!g) {
      g = {
        guardianId: row.guardian_id,
        name: row.guardian_name,
        email: row.guardian_email,
        phone: row.guardian_phone,
        active: row.guardian_active !== false,
        createdAt: row.created_at,
        wards: [],
      };
      byGuardian.set(row.guardian_id, g);
    }
    if (row.ward) {
      g.wards.push({
        linkId: row.id,
        relationship: row.relationship,
        ...row.ward,
      });
    }
  }

  // Hide soft-deleted guardians (they live on in deleted_accounts for restore).
  const { data: del } = await supabase
    .from("deleted_accounts")
    .select("target_id")
    .eq("account_type", "guardian")
    .is("restored_at", null)
    .is("purged_at", null);
  const deletedIds = new Set((del ?? []).map((d) => d.target_id));

  const guardians = [...byGuardian.values()].filter(
    (g) => !deletedIds.has(g.guardianId)
  );
  return { guardians, error: null };
}

// PWD beneficiary: list the guardian account(s) linked to the signed-in PWD,
// including each guardian's activation status. Used to warn the PWD when a
// linked guardian has been deactivated. RLS scopes rows to pwd_id = auth.uid().
export async function getMyGuardians() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { guardians: [], error: { message: "Not signed in." } };

  const { data, error } = await supabase
    .from("guardian_ward_links")
    .select(
      "id, guardian_id, guardian_name, guardian_email, guardian_phone, guardian_active, relationship, removed_at, dismissed_at"
    )
    .eq("pwd_id", user.id)
    .is("dismissed_at", null)
    .order("created_at", { ascending: true });
  return { guardians: data ?? [], error };
}

// PWD beneficiary: dismiss a removed guardian from their own dashboard view.
export async function dismissRemovedGuardian(linkId) {
  const { data, error } = await supabase.functions.invoke("dismiss-guardian", {
    body: { linkId },
  });
  if (error) return { ok: false, error };
  return { ok: Boolean(data?.ok), error: null };
}

// PDAO staff: list guardians linked to a given PWD ward. Soft-deleted guardians
// are excluded (their link lingers for restore but shouldn't display).
export async function getGuardiansForPwd(pwdId) {
  const { data, error } = await supabase
    .from("guardian_ward_links")
    .select("*")
    .eq("pwd_id", pwdId)
    .is("removed_at", null)
    .order("created_at", { ascending: true });
  if (error) return { guardians: [], error };

  const { data: del } = await supabase
    .from("deleted_accounts")
    .select("target_id")
    .eq("account_type", "guardian")
    .is("restored_at", null)
    .is("purged_at", null);
  const deletedIds = new Set((del ?? []).map((d) => d.target_id));

  return {
    guardians: (data ?? []).filter((g) => !deletedIds.has(g.guardian_id)),
    error: null,
  };
}

// Guardian: list the wards linked to the signed-in guardian, with each ward's
// profile and source application (for the digital ID).
export async function getMyWards() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { wards: [], error: { message: "Not signed in." } };

  const { data, error } = await supabase
    .from("guardian_ward_links")
    .select(
      "id, relationship, dismissed_at, ward:pwd_id(*, application:application_id(application_number, status, approval, submitted_at))"
    )
    .eq("guardian_id", user.id)
    .is("removed_at", null)
    .order("created_at", { ascending: true });

  return { wards: data ?? [], error };
}
