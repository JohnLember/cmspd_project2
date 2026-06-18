import { supabase } from "./client.js";

// Fetch the signed-in user's profile, seeding it from their linked application
// the first time (e.g. accounts approved before the profile table existed).
export async function getMyProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { profile: null, user: null, error: { message: "Not signed in." } };
  }

  const profileSelect =
    "*, application:application_id(application_number, status, approval, submitted_at)";

  const { data: existing, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle();
  if (error) return { profile: null, user, error };
  if (existing) return { profile: existing, user, error: null };

  // No profile yet — seed from the most recent linked application.
  const { data: app } = await supabase
    .from("applications")
    .select("*")
    .eq("pwd_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const d = app?.data ?? {};
  const seed = {
    id: user.id,
    full_name: app?.applicant_name ?? user.user_metadata?.full_name ?? "",
    contact_number: app?.contact_number ?? "",
    personal_email: app?.email ?? d.emailAddress ?? "",
    address: app?.address ?? "",
    barangay: app?.barangay ?? "",
    birthdate: d.birthdate ?? null,
    sex: d.gender ?? null,
    civil_status: d.civilStatus ?? null,
    application_id: app?.id ?? null,
    data: app?.data ?? null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert(seed)
    .select(profileSelect)
    .single();
  if (insertError) return { profile: seed, user, error: insertError };
  return { profile: inserted, user, error: null };
}

// PDAO staff: list all registered PWD profiles with their source application.
// RLS restricts this to the pdao role.
export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "*, application:application_id(application_number, status, subsidy_type, approval, submitted_at)"
    )
    .order("created_at", { ascending: false });
  return { profiles: data ?? [], error };
}

export async function updateProfile(id, fields) {
  const { error } = await supabase.from("profiles").update(fields).eq("id", id);
  return { error };
}

// Uploads a profile picture to avatars/<uid>/..., stores the public URL on the
// profile and the auth user metadata, and returns the URL.
export async function uploadAvatar(userId, file) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) return { url: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);
  if (profileError) return { url: publicUrl, error: profileError };

  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
  return { url: publicUrl, error: null };
}

export async function updateAccountEmail(email) {
  const { error } = await supabase.auth.updateUser({ email });
  return { error };
}

export async function updateAccountPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
}
