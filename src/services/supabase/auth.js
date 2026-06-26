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

// Update the signed-in user's display name (stored in user_metadata.full_name).
// Triggers a USER_UPDATED auth event, so AuthProvider refreshes automatically.
export async function updateAccountName(fullName) {
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  return { error };
}

// Upload a profile picture for the signed-in user to avatars/<uid>/... and store
// the public URL on user_metadata.avatar_url. Used by accounts without a profiles
// row (e.g. PDAO staff). Returns { url, error }.
export async function uploadAccountAvatar(file) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: { message: "Not signed in." } };

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) return { url: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });
  if (metaError) return { url: publicUrl, error: metaError };

  return { url: publicUrl, error: null };
}

export async function sendPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/login`,
  });
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
