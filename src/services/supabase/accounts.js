import { supabase } from "./client.js";

// PDAO staff: activate or deactivate a PWD or guardian account. Deactivating
// bans sign-in and flips the status flag the linked accounts can read.
// `{ targetId, type: "pwd" | "guardian", active }` -> `{ ok, error }`.
export async function setAccountStatus({ targetId, type, active }) {
  const { data, error } = await supabase.functions.invoke("set-account-status", {
    body: { targetId, type, active },
  });
  if (error) {
    let message = error.message;
    try {
      const b = await error.context?.json?.();
      if (b?.error) message = b.error;
    } catch {
      // keep generic message
    }
    return { ok: false, error: { message } };
  }
  return { ok: Boolean(data?.ok), error: null };
}

// Account lifecycle (soft delete / restore / permanent purge) via the
// `manage-account` edge function. Delete is soft — it hides the account and
// keeps sign-in blocked, but retains data so it can be restored. Only a
// deactivated account can be deleted.
async function manageAccount(payload) {
  const { data, error } = await supabase.functions.invoke("manage-account", {
    body: payload,
  });
  if (error) {
    let message = error.message;
    let unreassigned = null;
    try {
      const b = await error.context?.json?.();
      if (b?.error) message = b.error;
      if (b?.unreassigned) unreassigned = b.unreassigned;
    } catch {
      // keep generic message
    }
    return { ok: false, error: { message }, unreassigned };
  }
  return { ok: Boolean(data?.ok), error: null, unreassigned: null };
}

export const deleteAccount = ({ targetId, type }) =>
  manageAccount({ action: "delete", targetId, type });

export const restoreAccount = ({ targetId, type }) =>
  manageAccount({ action: "restore", targetId, type });

export const purgeAccount = ({ targetId, type }) =>
  manageAccount({ action: "purge", targetId, type });

// PDAO: reveal a beneficiary's login email + deterministic temporary password
// (and optionally reset the password back to it). Backs the "Login credentials"
// panel in the PWD/Guardian detail modals.
export async function getAccountCredentials({ targetId, type, reset = false }) {
  const { data, error } = await supabase.functions.invoke("account-credentials", {
    body: { targetId, type, reset },
  });
  if (error) {
    let message = error.message;
    try {
      const b = await error.context?.json?.();
      if (b?.error) message = b.error;
    } catch {
      // keep generic message
    }
    return { ok: false, error: { message } };
  }
  if (!data?.ok) {
    return { ok: false, error: { message: data?.error || "Unable to load credentials." } };
  }
  return {
    ok: true,
    email: data.email,
    password: data.password,
    wasReset: Boolean(data.wasReset),
    error: null,
  };
}

// PDAO: the deleted-account history (active soft-deletions only — restored and
// purged rows drop off). Backs the Settings "Deleted history" section.
export async function getDeletedAccounts() {
  const { data, error } = await supabase
    .from("deleted_accounts")
    .select("*")
    .is("restored_at", null)
    .is("purged_at", null)
    .order("deleted_at", { ascending: false });
  return { records: data ?? [], error };
}
