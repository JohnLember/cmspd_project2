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

function isBanned(user: any): boolean {
  const b = user?.banned_until;
  return Boolean(b) && new Date(b) > new Date();
}

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
    if (callerErr || !caller?.user) return json({ error: "Unauthorized" }, 401);
    if (caller.user.user_metadata?.role !== "pdao") {
      return json({ error: "Forbidden: PDAO role required" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as string | undefined;
    const targetId = body.targetId as string | undefined;
    const type = body.type as string | undefined;
    if (!targetId || (type !== "pwd" && type !== "guardian")) {
      return json({ error: "targetId and a valid type are required." }, 400);
    }
    if (!["delete", "restore", "purge"].includes(action ?? "")) {
      return json({ error: "A valid action is required." }, 400);
    }
    if (targetId === caller.user.id) {
      return json({ error: "You cannot delete your own account." }, 400);
    }

    const callerId = caller.user.id;

    // -------- DELETE (soft) --------
    if (action === "delete") {
      const { data: targetUser } = await admin.auth.admin.getUserById(targetId);

      // Guard: only a deactivated account can be deleted. Accept the ban signal
      // or the app's denormalized "active=false" flag.
      let deactivated = isBanned(targetUser?.user);

      // Block a second active deletion.
      const { data: already } = await admin
        .from("deleted_accounts")
        .select("id")
        .eq("target_id", targetId)
        .is("restored_at", null)
        .is("purged_at", null)
        .maybeSingle();
      if (already) return json({ error: "This account is already deleted." }, 409);

      let snapshot: Record<string, unknown> = {};

      if (type === "pwd") {
        const { data: profile } = await admin
          .from("profiles")
          .select("full_name, personal_email, contact_number, barangay, pwd_id_number, active")
          .eq("id", targetId)
          .maybeSingle();
        if (!profile) return json({ error: "PWD profile not found." }, 404);
        if (!deactivated && profile.active === false) deactivated = true;
        if (!deactivated) {
          return json({ error: "Deactivate the account before deleting it." }, 400);
        }
        snapshot = {
          full_name: profile.full_name,
          email: targetUser?.user?.email ?? null,
          personal_email: profile.personal_email,
          barangay: profile.barangay,
          pwd_id_number: profile.pwd_id_number,
        };
        const { error } = await admin
          .from("profiles")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", targetId);
        if (error) return json({ error: error.message }, 400);
      } else {
        // guardian: every ward must already have another guardian (reassigned).
        const { data: myLinks } = await admin
          .from("guardian_ward_links")
          .select("id, pwd_id, guardian_active, guardian_name, ward:pwd_id(full_name)")
          .eq("guardian_id", targetId);
        const links = myLinks ?? [];
        if (!deactivated && links.some((l: any) => l.guardian_active === false)) {
          deactivated = true;
        }
        if (!deactivated) {
          return json({ error: "Deactivate the account before deleting it." }, 400);
        }
        if (links.length) {
          const pwdIds = links.map((l: any) => l.pwd_id);
          const { data: others } = await admin
            .from("guardian_ward_links")
            .select("pwd_id")
            .in("pwd_id", pwdIds)
            .neq("guardian_id", targetId);
          const covered = new Set((others ?? []).map((o: any) => o.pwd_id));
          const uncovered = links.filter((l: any) => !covered.has(l.pwd_id));
          if (uncovered.length) {
            return json(
              {
                error:
                  "Reassign this guardian's ward(s) to another guardian before deleting.",
                unreassigned: uncovered.map((l: any) => ({
                  linkId: l.id,
                  pwdId: l.pwd_id,
                  name: l.ward?.full_name ?? null,
                })),
              },
              409,
            );
          }
        }
        snapshot = {
          full_name: targetUser?.user?.user_metadata?.full_name ??
            links[0]?.guardian_name ?? null,
          email: targetUser?.user?.email ?? null,
          wards: links.map((l: any) => l.ward?.full_name).filter(Boolean),
        };
        // End each ward relationship. removed_at persists through a later
        // account restore, so this guardian is never re-added to the PWD; the
        // PWD sees it as "removed" until they dismiss it.
        await admin
          .from("guardian_ward_links")
          .update({ removed_at: new Date().toISOString() })
          .eq("guardian_id", targetId)
          .is("removed_at", null);
      }

      const { error: insErr } = await admin.from("deleted_accounts").insert({
        account_type: type,
        target_id: targetId,
        snapshot,
        deleted_by: callerId,
      });
      if (insErr) return json({ error: insErr.message }, 400);

      return json({ ok: true, action, targetId, type });
    }

    // Both restore and purge act on an existing active deletion.
    const { data: rec } = await admin
      .from("deleted_accounts")
      .select("*")
      .eq("target_id", targetId)
      .is("restored_at", null)
      .is("purged_at", null)
      .maybeSingle();
    if (!rec) return json({ error: "No active deletion for this account." }, 404);

    // -------- RESTORE --------
    if (action === "restore") {
      if (type === "pwd") {
        await admin
          .from("profiles")
          .update({ deleted_at: null, active: true })
          .eq("id", targetId);
        // Un-dismiss so guardians see the restored ward again.
        await admin
          .from("guardian_ward_links")
          .update({ dismissed_at: null })
          .eq("pwd_id", targetId);
      } else {
        // Guardian restore only lifts the ban. Ward links keep their removed_at,
        // so the guardian is NOT re-added to any PWD (its wards were reassigned).
      }
      // Lift the sign-in ban so the restored account is usable again.
      await admin.auth.admin.updateUserById(targetId, { ban_duration: "none" });

      await admin
        .from("deleted_accounts")
        .update({ restored_at: new Date().toISOString(), restored_by: callerId })
        .eq("id", rec.id);

      return json({ ok: true, action, targetId, type });
    }

    // -------- PURGE (hard delete) --------
    if (action === "purge") {
      const { error: delErr } = await admin.auth.admin.deleteUser(targetId);
      // Ignore "user not found" — the auth row may already be gone; still tombstone.
      if (delErr && !/not.*found/i.test(delErr.message)) {
        return json({ error: delErr.message }, 400);
      }
      await admin
        .from("deleted_accounts")
        .update({ purged_at: new Date().toISOString(), purged_by: callerId })
        .eq("id", rec.id);

      return json({ ok: true, action, targetId, type });
    }

    return json({ error: "Unsupported action." }, 400);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
