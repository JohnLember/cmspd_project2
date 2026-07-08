import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Normalize a PH mobile number to 09xxxxxxxxx, or null if invalid.
function normalizePhone(raw: string): string | null {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("63") && d.length === 12) d = "0" + d.slice(2);
  if (/^09\d{9}$/.test(d)) return d;
  return null;
}

// ---- "When" formatting for the email ----
function fmtDateLong(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function fmtTime12(hm: string): string {
  const [h, mi] = hm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mi).padStart(2, "0")} ${period}`;
}

function buildWhen(date: string | null, start: string | null, end: string | null): string {
  const parts: string[] = [];
  if (date) parts.push(fmtDateLong(date));
  const s = start ? fmtTime12(start) : "";
  const e = end ? fmtTime12(end) : "";
  const range = s && e ? `${s} – ${e}` : (s || e);
  if (range) parts.push(range);
  return parts.join(", ");
}

function announcementHtml(
  name: string,
  title: string,
  message: string,
  whenText: string,
  itemText: string,
): string {
  const safeBody = escapeHtml(message).replace(/\n/g, "<br/>");
  const whenBlock = whenText
    ? `<p style="margin:0 0 6px;color:#0f172a;font-size:14px"><strong>When:</strong> ${escapeHtml(whenText)}</p>`
    : "";
  const itemBlock = itemText
    ? `<p style="margin:0 0 14px;color:#0f172a;font-size:14px"><strong>Item / Assistance:</strong> ${escapeHtml(itemText)}</p>`
    : "";
  return `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff">
      <p style="margin:0 0 4px;font-size:13px;color:#1d4ed8;font-weight:600">PDAO — Municipality of Loreto</p>
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px">${escapeHtml(title)}</h2>
      ${whenBlock}
      ${itemBlock}
      <div style="color:#374151;font-size:15px;line-height:1.6">${safeBody}</div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="margin:0;color:#6b7280;font-size:13px">Hi ${escapeHtml(name)}, you are receiving this because your personal email is verified in the CMSPD portal. Sign in to view all announcements.</p>
    </div>`;
}

// Build the SMS body. SMS bills per 160-char segment, so cap the length to keep
// the cost predictable and point recipients to the portal for the full text.
function announcementSms(title: string, message: string, whenText: string, itemText: string): string {
  const when = whenText ? ` (When: ${whenText})` : "";
  const item = itemText ? ` [Item: ${itemText}]` : "";
  const base = `[PDAO Loreto] ${title}${when}${item}: ${message}`;
  const text = base.length > 300 ? `${base.slice(0, 297)}...` : base;
  return text;
}

async function sendSemaphoreBatch(
  apiKey: string,
  sender: string | undefined,
  numbers: string[],
  message: string,
): Promise<{ sent: number; error: string | null }> {
  let sent = 0;
  let error: string | null = null;
  // Semaphore accepts a comma-separated list of numbers in one request.
  // Chunk to stay well within limits.
  for (let i = 0; i < numbers.length; i += 500) {
    const chunk = numbers.slice(i, i + 500);
    const params = new URLSearchParams();
    params.set("apikey", apiKey);
    params.set("number", chunk.join(","));
    params.set("message", message);
    if (sender) params.set("sendername", sender);
    const res = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("Semaphore batch error:", data);
      error = Array.isArray(data)
        ? JSON.stringify(data)
        : data?.message ?? "Some SMS messages could not be sent.";
    } else {
      sent += Array.isArray(data) ? data.length : chunk.length;
    }
  }
  return { sent, error };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromAddress = Deno.env.get("RESEND_FROM") ??
      "CMSPD Loreto <onboarding@resend.dev>";
    const smsApiKey = Deno.env.get("SEMAPHORE_API_KEY");
    const smsSender = Deno.env.get("SEMAPHORE_SENDER_NAME") || undefined;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Authorize: PDAO staff only.
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: caller, error: callerErr } = await admin.auth.getUser(token);
    if (callerErr || !caller?.user) return json({ error: "Unauthorized" }, 401);
    if (caller.user.user_metadata?.role !== "pdao") {
      return json({ error: "Forbidden: PDAO role required" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").trim();
    const message = String(body.body ?? "").trim();
    // Optional "When": event date + start/end time.
    const rawEventDate = String(body.eventDate ?? "").trim();
    const eventDate = DATE_RE.test(rawEventDate) ? rawEventDate : null;
    const rawStart = String(body.startTime ?? "").trim();
    const startTime = TIME_RE.test(rawStart) ? rawStart : null;
    const rawEnd = String(body.endTime ?? "").trim();
    const endTime = TIME_RE.test(rawEnd) ? rawEnd : null;
    // Optional item/assistance for a distribution event.
    const rawItem = String(body.itemType ?? "").trim();
    const itemType = rawItem || null;
    if (!title || !message) {
      return json({ error: "Title and message are required." }, 400);
    }

    const whenText = buildWhen(eventDate, startTime, endTime);
    const itemText = itemType ?? "";

    // Create the announcement (this is what every portal already reads).
    const { data: announcement, error: insErr } = await admin
      .from("announcements")
      .insert({
        title,
        body: message,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        item_type: itemType,
        created_by: caller.user.id,
      })
      .select()
      .single();
    if (insErr) return json({ error: insErr.message }, 400);

    // ---- Email broadcast: profiles whose personal email is verified ----
    const { data: rows } = await admin
      .from("profiles")
      .select("personal_email, full_name")
      .eq("personal_email_verified", true)
      .not("personal_email", "is", null);

    const recipients = (rows ?? [])
      .map((r) => ({
        email: String(r.personal_email ?? "").trim(),
        name: r.full_name || "PWD beneficiary",
      }))
      .filter((r) => EMAIL_RE.test(r.email));

    let emailedCount = 0;
    let emailError: string | null = null;

    if (!resendKey) {
      emailError =
        "Announcement posted, but no emails were sent (RESEND_API_KEY secret is not set).";
    } else if (recipients.length > 0) {
      const subject = `PDAO Loreto announcement: ${title}`;
      for (let i = 0; i < recipients.length; i += 100) {
        const chunk = recipients.slice(i, i + 100);
        const payload = chunk.map((r) => ({
          from: fromAddress,
          to: r.email,
          subject,
          html: announcementHtml(r.name, title, message, whenText, itemText),
        }));
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Resend batch error:", data);
          emailError = data?.message ?? "Some emails could not be sent.";
        } else {
          emailedCount += Array.isArray(data?.data)
            ? data.data.length
            : chunk.length;
        }
      }
    }

    // ---- SMS broadcast: verified PWD numbers + verified guardian numbers ----
    // PWD numbers live on profiles.contact_number (contact_verified = true).
    // Guardian numbers live on the auth user_metadata (contact_number_verified).
    let smsCount = 0;
    let smsRecipientCount = 0;
    let smsError: string | null = null;

    const phoneSet = new Set<string>();

    const { data: pwdRows } = await admin
      .from("profiles")
      .select("contact_number")
      .eq("contact_verified", true)
      .not("contact_number", "is", null);
    for (const r of pwdRows ?? []) {
      const n = normalizePhone(String(r.contact_number ?? ""));
      if (n) phoneSet.add(n);
    }

    // Guardians: page through auth users and pick verified guardian numbers.
    try {
      let page = 1;
      for (;;) {
        const { data: list } = await admin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        const users = list?.users ?? [];
        for (const u of users) {
          if (
            u.user_metadata?.role === "guardian" &&
            u.user_metadata?.contact_number_verified
          ) {
            const n = normalizePhone(String(u.user_metadata?.contact_number ?? ""));
            if (n) phoneSet.add(n);
          }
        }
        if (users.length < 1000) break;
        page += 1;
      }
    } catch (e) {
      console.error("listUsers error:", e);
    }

    const numbers = [...phoneSet];
    smsRecipientCount = numbers.length;

    if (numbers.length > 0) {
      if (!smsApiKey) {
        smsError =
          "No SMS sent (SEMAPHORE_API_KEY secret is not set).";
      } else {
        const { sent, error } = await sendSemaphoreBatch(
          smsApiKey,
          smsSender,
          numbers,
          announcementSms(title, message, whenText, itemText),
        );
        smsCount = sent;
        smsError = error;
      }
    }

    return json({
      announcement,
      emailedCount,
      recipientCount: recipients.length,
      emailError,
      smsCount,
      smsRecipientCount,
      smsError,
    });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
