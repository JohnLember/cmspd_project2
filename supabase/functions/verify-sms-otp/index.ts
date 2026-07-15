import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Mirrors create-guardian's sanitize() so we recompute the SAME value it used
// when deriving the account password.
function sanitize(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Normalize a PH mobile number to the 11-digit 09xxxxxxxxx form Semaphore wants.
function normalizePhone(raw: string): string | null {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("63") && d.length === 12) d = "0" + d.slice(2);
  if (/^09\d{9}$/.test(d)) return d;
  return null;
}

async function sendSemaphoreSms(
  apiKey: string,
  sender: string | undefined,
  number: string,
  message: string,
): Promise<{ ok: boolean; error: string | null }> {
  const params = new URLSearchParams();
  params.set("apikey", apiKey);
  params.set("number", number);
  params.set("message", message);
  if (sender) params.set("sendername", sender);

  const res = await fetch("https://api.semaphore.co/api/v4/messages", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("Semaphore error:", data);
    const msg = Array.isArray(data)
      ? JSON.stringify(data)
      : data?.message ?? (typeof data === "object" ? JSON.stringify(data) : String(data));
    return { ok: false, error: msg || "Unable to send the SMS." };
  }
  return { ok: true, error: null };
}

// Best-effort: text the guardian confirming verification and reminding them of
// their login email + password. Guardians have no real email inbox, so their
// verified mobile number is the channel we use. Never throws.
// ponytail: recomputes the creation-time password (last name + account creation
// year). Goes stale if the guardian later changes their password. Accepted.
async function sendGuardianCredentials(admin: any, user: any, phone: string) {
  try {
    const apiKey = Deno.env.get("SEMAPHORE_API_KEY");
    if (!apiKey || !phone) return;
    const sender = Deno.env.get("SEMAPHORE_SENDER_NAME") || undefined;

    // guardian_ward_links.guardian_name is the PDAO-original full name whose
    // last token seeded the password (guardian-edited full_name is not).
    const { data: link } = await admin
      .from("guardian_ward_links")
      .select("guardian_name")
      .eq("guardian_id", user.id)
      .limit(1)
      .maybeSingle();
    const lastRaw = (link?.guardian_name || user.user_metadata?.full_name || "")
      .trim()
      .split(/\s+/)
      .pop() || "";
    const lastName = sanitize(lastRaw);
    if (!lastName) return; // cannot recompute a trustworthy password; skip.
    const year = new Date(user.created_at).getFullYear();
    const password = `${lastName}@${year}`;

    const message =
      `CMSPD Loreto: your mobile number is verified. Login email: ${user.email} Password: ${password}. Keep these details private.`;
    await sendSemaphoreSms(apiKey, sender, phone, message);
  } catch (e) {
    console.error("sendGuardianCredentials failed:", e);
  }
}

const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let payload: { code?: string };
    try {
      payload = await req.json();
    } catch {
      return json({ ok: false, error: "Invalid request." });
    }
    const code = String(payload?.code ?? "").trim();
    if (!/^[0-9]{6}$/.test(code)) {
      return json({ ok: false, error: "Enter the 6-digit code." });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ ok: false, error: "Not signed in." }, 401);

    const role = user.user_metadata?.role;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: otp } = await admin
      .from("sms_otps")
      .select("*")
      .eq("user_id", user.id)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return json({ ok: false, error: "No active code. Request a new one." });
    }
    if (new Date(otp.expires_at) < new Date()) {
      return json({ ok: false, error: "This code has expired. Request a new one." });
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      return json({ ok: false, error: "Too many attempts. Request a new code." });
    }

    const hash = await sha256(code);
    if (hash !== otp.code_hash) {
      await admin
        .from("sms_otps")
        .update({ attempts: otp.attempts + 1 })
        .eq("id", otp.id);
      return json({ ok: false, error: "Incorrect code. Please try again." });
    }

    // Re-check the current number still matches the one the code was issued for,
    // so a number changed after the code was sent cannot be marked verified.
    if (role === "pwd") {
      const { data: profile } = await admin
        .from("profiles")
        .select("contact_number")
        .eq("id", user.id)
        .single();
      if (normalizePhone(profile?.contact_number ?? "") !== otp.phone) {
        return json({
          ok: false,
          error: "Your mobile number changed. Save it and request a new code.",
        });
      }
      await admin
        .from("profiles")
        .update({ contact_verified: true })
        .eq("id", user.id);
    } else if (role === "guardian") {
      if (normalizePhone(String(user.user_metadata?.contact_number ?? "")) !== otp.phone) {
        return json({
          ok: false,
          error: "Your mobile number changed. Save it and request a new code.",
        });
      }
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          contact_number_verified: true,
        },
      });
    } else {
      return json({ ok: false, error: "Unsupported account type." });
    }

    await admin
      .from("sms_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", otp.id);

    // Guardians verify by SMS (no email inbox) — text them their login
    // credentials on success (best-effort).
    if (role === "guardian") {
      await sendGuardianCredentials(admin, user, otp.phone);
    }

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) });
  }
});
