import { supabase } from "./client.js";

export const mapSessionUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.user_metadata?.role ?? null,
  fullName:
    user.user_metadata?.full_name || user.user_metadata?.name || "",
  avatarUrl: user.user_metadata?.avatar_url || "",
});

export async function getAuthSession() {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data?.session ?? null,
    error,
  };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data?.user ? mapSessionUser(data.user) : null,
    session: data?.session ?? null,
    error,
  };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function sendPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/login`,
  });
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
