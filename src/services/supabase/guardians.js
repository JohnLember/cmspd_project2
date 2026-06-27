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
    .select("guardian_id, guardian_name, guardian_email, guardian_phone");
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
      "id, guardian_id, guardian_name, guardian_email, guardian_phone, relationship, created_at, ward:pwd_id(id, full_name, pwd_id_number, barangay)"
    )
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
  return { guardians: [...byGuardian.values()], error: null };
}

// PDAO staff: list guardians linked to a given PWD ward.
export async function getGuardiansForPwd(pwdId) {
  const { data, error } = await supabase
    .from("guardian_ward_links")
    .select("*")
    .eq("pwd_id", pwdId)
    .order("created_at", { ascending: true });
  return { guardians: data ?? [], error };
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
      "id, relationship, ward:pwd_id(*, application:application_id(application_number, status, approval, submitted_at))"
    )
    .eq("guardian_id", user.id)
    .order("created_at", { ascending: true });

  return { wards: data ?? [], error };
}
