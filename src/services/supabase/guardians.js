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

// PDAO staff: list guardians linked to a given PWD ward.
export async function getGuardiansForPwd(pwdId) {
  const { data, error } = await supabase
    .from("ward_links")
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
    .from("ward_links")
    .select(
      "id, relationship, ward:pwd_id(*, application:application_id(application_number, status, approval, submitted_at))"
    )
    .eq("guardian_id", user.id)
    .order("created_at", { ascending: true });

  return { wards: data ?? [], error };
}
