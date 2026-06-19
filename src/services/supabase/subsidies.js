import { supabase } from "./client.js";

// PWD: list the signed-in beneficiary's own subsidies, newest first.
export async function getMySubsidies() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { subsidies: [], error: { message: "Not signed in." } };

  const { data, error } = await supabase
    .from("subsidies")
    .select("*")
    .eq("pwd_id", user.id)
    .order("created_at", { ascending: false });
  return { subsidies: data ?? [], error };
}

// PDAO (or a linked guardian): list a specific PWD's subsidies.
export async function getSubsidiesForPwd(pwdId) {
  const { data, error } = await supabase
    .from("subsidies")
    .select("*")
    .eq("pwd_id", pwdId)
    .order("created_at", { ascending: false });
  return { subsidies: data ?? [], error };
}

// PDAO: record a subsidy for a PWD.
export async function addSubsidy(pwdId, fields) {
  const { data, error } = await supabase
    .from("subsidies")
    .insert({ pwd_id: pwdId, ...fields })
    .select()
    .single();
  return { subsidy: data ?? null, error };
}

// PDAO: update a subsidy's status (and release date when released).
export async function updateSubsidy(id, fields) {
  const { error } = await supabase.from("subsidies").update(fields).eq("id", id);
  return { error };
}
