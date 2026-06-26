import { supabase } from "./client.js";

// Pull a readable error message out of a FunctionsHttpError. Non-2xx responses
// surface the JSON body (with our `error` field) on error.context, not in data.
async function functionError(error) {
  let message = error.message;
  try {
    const body = await error.context?.json?.();
    if (body?.error) message = body.error;
  } catch {
    // keep the generic message
  }
  return { message };
}

// PDAO only. Create another PDAO staff account via the create-pdao edge
// function (service role sets user_metadata.role = "pdao"). Returns
// { user: { id, email, fullName, createdAt, lastSignInAt }, error }.
export async function createPdaoUser({ fullName, email, password }) {
  const { data, error } = await supabase.functions.invoke("create-pdao", {
    body: { fullName, email, password },
  });
  if (error) return { user: null, error: await functionError(error) };
  return { user: data?.user ?? null, error: null };
}

// PDAO only. List existing PDAO staff accounts. Returns { users, error }.
export async function listPdaoUsers() {
  const { data, error } = await supabase.functions.invoke("create-pdao", {
    body: { action: "list" },
  });
  if (error) return { users: [], error: await functionError(error) };
  return { users: data?.users ?? [], error: null };
}
