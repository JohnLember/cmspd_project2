import { supabase } from "./client.js";

// Recipient tracking for a distribution announcement/event: who is entitled to
// the assistance, and who has physically received it (with a receipt number).

const PROFILE_COLS =
  "id, full_name, barangay, pwd_id_number, avatar_url, data";

// A short human-readable receipt number, e.g. RCPT-2026-1A2B3C4D.
export function makeReceiptNumber() {
  const year = new Date().getFullYear();
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const hex = [...bytes]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `RCPT-${year}-${hex}`;
}

// All recipients for one announcement, joined to each PWD's profile.
export async function getRecipients(announcementId) {
  const { data, error } = await supabase
    .from("announcement_recipients")
    .select(`*, profile:pwd_id(${PROFILE_COLS})`)
    .eq("announcement_id", announcementId)
    .order("created_at", { ascending: true });
  return { recipients: data ?? [], error };
}

// PDAO reports: every assistance record across all distributions, each with its
// parent announcement's item/title so a report can group by PWD. PDAO-gated by
// the same RLS as getRecipients.
export async function getAllRecipients() {
  const { data, error } = await supabase
    .from("announcement_recipients")
    .select(
      "pwd_id, quantity, status, received_at, receipt_number, announcement:announcement_id(title, item_type, event_date)"
    );
  return { recipients: data ?? [], error };
}

// PWD portal: the assistance the signed-in PWD has been given, with the parent
// announcement (item/title/date) so the portal can list and reprint receipts.
export async function getMyAssistance() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { recipients: [], error: { message: "Not signed in." } };

  const { data, error } = await supabase
    .from("announcement_recipients")
    .select(
      "*, announcement:announcement_id(id, title, item_type, event_date)"
    )
    .eq("pwd_id", user.id)
    .order("created_at", { ascending: false });
  return { recipients: data ?? [], error };
}

// PDAO: add PWDs to an announcement. Upsert so re-adding is a no-op.
export async function addRecipients(announcementId, pwdIds) {
  const rows = pwdIds.map((pwd_id) => ({
    announcement_id: announcementId,
    pwd_id,
  }));
  const { data, error } = await supabase
    .from("announcement_recipients")
    .upsert(rows, {
      onConflict: "announcement_id,pwd_id",
      ignoreDuplicates: true,
    })
    .select();
  return { recipients: data ?? [], error };
}

export async function removeRecipient(recipientId) {
  const { error } = await supabase
    .from("announcement_recipients")
    .delete()
    .eq("id", recipientId);
  return { error };
}

export async function updateRecipientQuantity(recipientId, quantity) {
  const { data, error } = await supabase
    .from("announcement_recipients")
    .update({ quantity: Math.max(1, quantity) })
    .eq("id", recipientId)
    .select()
    .single();
  return { recipient: data ?? null, error };
}

// Mark a recipient received (stamps date + generates a receipt number) or
// revert to pending (clears them).
export async function setReceived(recipientId, received, { quantity } = {}) {
  const updates = received
    ? {
        status: "received",
        received_at: new Date().toISOString(),
        receipt_number: makeReceiptNumber(),
      }
    : { status: "pending", received_at: null, receipt_number: null };
  if (quantity !== undefined) updates.quantity = Math.max(1, quantity);
  const { data, error } = await supabase
    .from("announcement_recipients")
    .update(updates)
    .eq("id", recipientId)
    .select(`*, profile:pwd_id(${PROFILE_COLS})`)
    .single();
  return { recipient: data ?? null, error };
}

// Pre-check-in lookup: resolve a typed PWD ID to its profile + existing
// recipient row (if any) so the check-in modal can show who it is and pre-fill
// the planned quantity BEFORE confirming. Returns { status, profile?, recipient? }
// where status is: "not_found" | "already" | "on_list" (pending) | "walk_in"
// (not on the list yet) | "error".
export async function findCheckInTarget(announcementId, pwdIdNumber) {
  const idNumber = (pwdIdNumber || "").trim();
  if (!idNumber) return { status: "not_found" };

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .ilike("pwd_id_number", idNumber)
    .maybeSingle();
  if (profErr) return { status: "error", error: profErr };
  if (!profile) return { status: "not_found" };

  const { data: existing } = await supabase
    .from("announcement_recipients")
    .select("*")
    .eq("announcement_id", announcementId)
    .eq("pwd_id", profile.id)
    .maybeSingle();

  if (existing?.status === "received") {
    return { status: "already", profile, recipient: existing };
  }
  if (existing) return { status: "on_list", profile, recipient: existing };
  return { status: "walk_in", profile };
}

// Check-in by typed PWD ID number. Handles: not found, already received,
// pending recipient, and walk-ins (not yet on the list). On success the row is
// marked received with a receipt number.
// Returns { status, recipient?, profile? } where status is one of:
//   "not_found" | "already" | "checked_in" | "walk_in" | "error".
export async function checkInByPwdId(announcementId, pwdIdNumber, { quantity = 1 } = {}) {
  const idNumber = (pwdIdNumber || "").trim();
  if (!idNumber) return { status: "not_found" };

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .ilike("pwd_id_number", idNumber)
    .maybeSingle();
  if (profErr) return { status: "error", error: profErr };
  if (!profile) return { status: "not_found" };

  const { data: existing } = await supabase
    .from("announcement_recipients")
    .select("*")
    .eq("announcement_id", announcementId)
    .eq("pwd_id", profile.id)
    .maybeSingle();

  if (existing?.status === "received") {
    return { status: "already", recipient: existing, profile };
  }

  let recipientId = existing?.id;
  const wasOnList = Boolean(existing);
  if (!recipientId) {
    const { data: inserted, error: insErr } = await supabase
      .from("announcement_recipients")
      .insert({ announcement_id: announcementId, pwd_id: profile.id })
      .select()
      .single();
    if (insErr) return { status: "error", error: insErr };
    recipientId = inserted.id;
  }

  const { recipient, error: updErr } = await setReceived(recipientId, true, {
    quantity,
  });
  if (updErr) return { status: "error", error: updErr };

  return { status: wasOnList ? "checked_in" : "walk_in", recipient, profile };
}
