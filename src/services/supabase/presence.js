import { supabase } from "./client.js";

// Single shared Realtime presence channel that tracks which users are currently
// online (signed in and connected). Keyed by user id so each account appears
// once regardless of how many tabs they have open.
const CHANNEL = "online-users";

let channel = null;
let onlineIds = new Set();
const listeners = new Set();

function notify() {
  for (const cb of listeners) cb(new Set(onlineIds));
}

function recompute() {
  if (!channel) return;
  // presenceState() => { [userId]: [{ ...meta }] }; the keys are the online ids.
  onlineIds = new Set(Object.keys(channel.presenceState()));
  notify();
}

// Join presence as the given user. Idempotent — calling again does nothing while
// already connected. Call leavePresence() first to switch users.
export function joinPresence(userId) {
  if (channel || !userId) return;
  channel = supabase.channel(CHANNEL, {
    config: { presence: { key: userId } },
  });
  channel
    .on("presence", { event: "sync" }, recompute)
    .on("presence", { event: "join" }, recompute)
    .on("presence", { event: "leave" }, recompute)
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ online_at: new Date().toISOString() });
      }
    });
}

// Leave presence. Synchronously clears the channel reference (avoids a race when
// switching users) and fires the cleanup in the background.
export function leavePresence() {
  const ch = channel;
  channel = null;
  onlineIds = new Set();
  notify();
  if (ch) {
    ch.untrack().catch(() => {});
    supabase.removeChannel(ch);
  }
}

// Subscribe to the set of online user ids. The callback fires immediately with
// the current set and again whenever presence changes. Returns an unsubscribe fn.
export function subscribeOnline(callback) {
  listeners.add(callback);
  callback(new Set(onlineIds));
  return () => listeners.delete(callback);
}
