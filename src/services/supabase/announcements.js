import { supabase } from "./client.js";

// Anyone signed in (PWD, guardian, PDAO) can read announcements.
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return { announcements: data ?? [], error };
}

// PDAO only. Runs the notify-announcement edge function, which creates the
// announcement AND emails every PWD beneficiary with a verified personal email
// (via Resend). Returns the created row plus how many recipients were emailed.
export async function createAnnouncement({ title, body }) {
  const { data, error } = await supabase.functions.invoke("notify-announcement", {
    body: { title, body },
  });

  if (error) {
    // Non-2xx responses surface as FunctionsHttpError; the JSON body (with our
    // `error` message) lives on error.context, not in `data`.
    let message = error.message;
    try {
      const errorBody = await error.context?.json?.();
      if (errorBody?.error) message = errorBody.error;
    } catch {
      // keep the generic message
    }
    return { announcement: null, emailedCount: 0, recipientCount: 0, error: { message } };
  }

  return {
    announcement: data?.announcement ?? null,
    emailedCount: data?.emailedCount ?? 0,
    recipientCount: data?.recipientCount ?? 0,
    emailError: data?.emailError ?? null,
    error: null,
  };
}

export async function updateAnnouncement(id, { title, body }) {
  const { data, error } = await supabase
    .from("announcements")
    .update({ title, body })
    .eq("id", id)
    .select()
    .single();
  return { announcement: data ?? null, error };
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  return { error };
}
