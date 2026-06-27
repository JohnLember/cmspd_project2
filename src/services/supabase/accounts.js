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
