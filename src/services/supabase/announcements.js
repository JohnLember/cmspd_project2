import { supabase } from "./client.js";

// Anyone signed in (PWD, guardian, PDAO) can read announcements.
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return { announcements: data ?? [], error };
}

// PDAO only (enforced by RLS).
export async function createAnnouncement({ title, body }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("announcements")
    .insert({ title, body, created_by: user?.id ?? null })
    .select()
    .single();
  return { announcement: data ?? null, error };
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
