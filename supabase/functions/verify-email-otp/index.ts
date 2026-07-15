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

// Mirrors approve-application's sanitize() so we recompute the SAME value it
// used when deriving the account password.
function sanitize(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Best-effort: email the beneficiary confirming verification and reminding them
// of their login email + password. Never throws — a delivery failure must not
// fail the verification that already succeeded.
// ponytail: recomputes the creation-time password (last name + account creation
// year). Goes stale if the PWD later changes their password; the fully-correct
// fix is to send credentials at approval time. Accepted trade-off.
async function sendPwdCredentials(admin: any, user: any, sendTo: string) {
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey || !sendTo) return;
    const fromAddress = Deno.env.get("RESEND_FROM") ??
      "CMSPD Loreto <onboarding@resend.dev>";

    const { data: profile } = await admin
      .from("profiles")
      .select("application_id, full_name, data")
      .eq("id", user.id)
      .single();

    let lastRaw = "";
    if (profile?.application_id) {
      const { data: app } = await admin
        .from("applications")
        .select("applicant_name, data")
        .eq("id", profile.application_id)
        .single();
      lastRaw = app?.data?.lastName ||
        (app?.applicant_name || "").trim().split(/\s+/).pop() || "";
    }
    if (!lastRaw) {
      lastRaw = profile?.data?.lastName ||
        (profile?.full_name || "").trim().split(/\s+/).pop() || "";
    }
    const lastName = sanitize(lastRaw);
    if (!lastName) return; // cannot recompute a trustworthy password; skip.
    const year = new Date(user.created_at).getFullYear();
    const password = `${lastName}@${year}`;
    const name = profile?.full_name || "PWD beneficiary";

    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px">
        <h2 style="margin:0 0 8px;color:#14532d">CMSPD Loreto</h2>
        <p style="margin:0 0 16px;color:#374151">Hi ${name}, your email address has been verified successfully.</p>
        <p style="margin:0 0 8px;color:#374151">Here are your CMSPD account login details:</p>
        <table style="border-collapse:collapse;margin:8px 0">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Account email</td><td style="font-weight:600;color:#111827">${user.email}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Password</td><td style="font-weight:600;color:#111827">${password}</td></tr>
        </table>
        <p style="margin:16px 0 0;color:#6b7280;font-size:13px">Keep these details private. You can change your password anytime from your profile.</p>
      </div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: sendTo,
        subject: "Your CMSPD email is verified",
        html,
      }),
    });
  } catch (e) {
    console.error("sendPwdCredentials failed:", e);
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

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: otp } = await admin
      .from("email_otps")
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
      return json({
        ok: false,
        error: "Too many attempts. Request a new code.",
      });
    }

    const hash = await sha256(code);
    if (hash !== otp.code_hash) {
      await admin
        .from("email_otps")
        .update({ attempts: otp.attempts + 1 })
        .eq("id", otp.id);
      return json({ ok: false, error: "Incorrect code. Please try again." });
    }

    await admin
      .from("email_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", otp.id);

    // Mark the personal email verified only if it still matches the one the
    // code was issued for.
    await admin
      .from("profiles")
      .update({ personal_email_verified: true })
      .eq("id", user.id)
      .eq("personal_email", otp.email);

    // Confirmation email with login credentials (best-effort).
    await sendPwdCredentials(admin, user, otp.email);

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) });
  }
});
