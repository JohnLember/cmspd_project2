import { supabase } from "./client.js";

// Mobile-number verification via Semaphore SMS (Edge Functions). Shared by the
// PWD profile (number on profiles.contact_number) and the guardian profile
// (number on auth user_metadata) — the function decides which to use from the
// caller's role. Both functions return 200 with an { ok, error } body.

export async function sendSmsOtp() {
  const { data, error } = await supabase.functions.invoke("send-sms-otp");
  if (error) return { ok: false, error: error.message };
  return { ok: Boolean(data?.ok), sentTo: data?.sentTo, error: data?.error ?? null };
}

export async function verifySmsOtp(code) {
  const { data, error } = await supabase.functions.invoke("verify-sms-otp", {
    body: { code },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: Boolean(data?.ok), error: data?.error ?? null };
}
