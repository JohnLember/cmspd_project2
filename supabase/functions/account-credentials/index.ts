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

// Same sanitize() approve-application / create-guardian used to derive the
// account password, so we recompute the identical value here.
function sanitize(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const lastToken = (name: string) =>
  (name || "").trim().split(/\s+/).pop() || "";

// PDAO: reveal a beneficiary's login email + deterministic temporary password,
// and optionally reset the password back to it (login emails are fake gov-domain
// addresses, so the normal email password-reset can't reach the user).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: caller, error: callerErr } = await admin.auth.getUser(token);
    if (callerErr || !caller?.user) return json({ ok: false, error: "Unauthorized" }, 401);
    if (caller.user.user_metadata?.role !== "pdao") {
      return json({ ok: false, error: "Forbidden: PDAO role required" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const targetId = body.targetId as string | undefined;
    const type = body.type as string | undefined;
    const reset = body.reset === true;
    if (!targetId || (type !== "pwd" && type !== "guardian")) {
      return json({ ok: false, error: "targetId and a valid type are required." }, 400);
    }

    const { data: got, error: getErr } = await admin.auth.admin.getUserById(targetId);
    if (getErr || !got?.user) return json({ ok: false, error: "Account not found." }, 404);
    const user = got.user;

    let lastRaw = "";
    if (type === "pwd") {
      const { data: profile } = await admin
        .from("profiles")
        .select("application_id, full_name, data")
        .eq("id", targetId)
        .maybeSingle();
      if (profile?.application_id) {
        const { data: app } = await admin
          .from("applications")
          .select("applicant_name, data")
          .eq("id", profile.application_id)
          .maybeSingle();
        lastRaw = app?.data?.lastName || lastToken(app?.applicant_name);
      }
      if (!lastRaw) {
        lastRaw = profile?.data?.lastName || lastToken(profile?.full_name);
      }
    } else {
      const { data: link } = await admin
        .from("guardian_ward_links")
        .select("guardian_name")
        .eq("guardian_id", targetId)
        .limit(1)
        .maybeSingle();
      lastRaw = lastToken(link?.guardian_name || user.user_metadata?.full_name);
    }

    const lastName = sanitize(lastRaw);
    if (!lastName) {
      return json(
        { ok: false, error: "Cannot derive the temporary password (missing last name)." },
        400,
      );
    }
    const year = new Date(user.created_at).getFullYear();
    const password = `${lastName}@${year}`;

    if (reset) {
      const { error: updErr } = await admin.auth.admin.updateUserById(targetId, {
        password,
      });
      if (updErr) return json({ ok: false, error: updErr.message }, 400);
    }

    return json({ ok: true, email: user.email, password, wasReset: reset });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 500);
  }
});
