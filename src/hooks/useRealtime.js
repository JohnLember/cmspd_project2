import { useEffect, useId, useRef } from "react";
import { supabase } from "../services/supabase/client.js";

// Subscribe to Postgres changes on a public table and run `onChange` for every
// insert/update/delete. The callback is held in a ref so re-renders don't tear
// down and rebuild the subscription. Pass an optional Realtime `filter` string
// (e.g. `id=eq.${userId}`) to scope events to specific rows.
//
// Requires the table to be in the `supabase_realtime` publication. RLS still
// applies, so users only receive changes to rows they can SELECT.
export function useRealtime(table, onChange, filter) {
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  }, [onChange]);
  // Unique per hook instance so two subscriptions to the same table/filter
  // (e.g. the announcements feed rendered twice) never share a channel name.
  const instanceId = useId();

  useEffect(() => {
    if (!table) return undefined;
    const channel = supabase
      .channel(`rt-${table}-${filter ?? "all"}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        (payload) => cb.current(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, instanceId]);
}
