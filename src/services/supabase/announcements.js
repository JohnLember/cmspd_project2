import { supabase } from "./client.js";

// Anyone signed in (PWD, guardian, PDAO) can read announcements.
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return { announcements: data ?? [], error };
}

// One announcement/event by id (used by the event management page).
export async function getAnnouncement(id) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();
  return { announcement: data ?? null, error };
}

// PDAO only. Runs the notify-announcement edge function, which creates the
// announcement AND emails every PWD beneficiary with a verified personal email
// (via Resend). Returns the created row plus how many recipients were emailed.
export async function createAnnouncement({
  title,
  body,
  eventDate,
  startTime,
  endTime,
  itemType,
  disabilityTypes,
}) {
  // null / empty = target all PWDs (All Types).
  const targets =
    Array.isArray(disabilityTypes) && disabilityTypes.length
      ? disabilityTypes
      : null;
  const { data, error } = await supabase.functions.invoke("notify-announcement", {
    body: {
      title,
      body,
      eventDate: eventDate || null,
      startTime: startTime || null,
      endTime: endTime || null,
      itemType: itemType || null,
      disabilityTypes: targets,
    },
  });

  if (error) {
    // Non-2xx responses surface as FunctionsHttpError; the JSON body (with our
    // `error` message) lives on error.context, not in `data`.
    let message = error.message;
    try {
      const errorBody = await error.context?.json?.();
      if (errorBody?.error) message = errorBody.error;
    } catch {
      // keep the generic message
    }
    return {
      announcement: null,
      emailedCount: 0,
      recipientCount: 0,
      smsCount: 0,
      smsRecipientCount: 0,
      error: { message },
    };
  }

  let announcement = data?.announcement ?? null;
  // Safety net: if the edge function version in use doesn't persist item_type /
  // disability_types yet, set them with a follow-up update (PDAO-gated by RLS).
  const followUp = {};
  if (itemType) followUp.item_type = itemType;
  if (targets) followUp.disability_types = targets;
  if (announcement && Object.keys(followUp).length) {
    const { data: updated } = await supabase
      .from("announcements")
      .update(followUp)
      .eq("id", announcement.id)
      .select()
      .single();
    if (updated) announcement = updated;
  }

  return {
    announcement,
    emailedCount: data?.emailedCount ?? 0,
    recipientCount: data?.recipientCount ?? 0,
    emailError: data?.emailError ?? null,
    smsCount: data?.smsCount ?? 0,
    smsRecipientCount: data?.smsRecipientCount ?? 0,
    smsError: data?.smsError ?? null,
    error: null,
  };
}

export async function updateAnnouncement(id, { title, body, eventDate, startTime, endTime, itemType, disabilityTypes }) {
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (body !== undefined) updates.body = body;
  // Only touch these when the caller passes them (undefined = leave as-is).
  if (eventDate !== undefined) updates.event_date = eventDate || null;
  if (startTime !== undefined) updates.start_time = startTime || null;
  if (endTime !== undefined) updates.end_time = endTime || null;
  if (itemType !== undefined) updates.item_type = itemType || null;
  if (disabilityTypes !== undefined) {
    updates.disability_types =
      Array.isArray(disabilityTypes) && disabilityTypes.length
        ? disabilityTypes
        : null;
  }
  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { announcement: data ?? null, error };
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  return { error };
}
