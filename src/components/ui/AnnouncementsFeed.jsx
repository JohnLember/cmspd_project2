import { useEffect, useState } from "react";
import { getAnnouncements } from "../../services/supabase/announcements.js";

const isRecent = (iso) =>
  iso && Date.now() - new Date(iso).getTime() < 3 * 24 * 60 * 60 * 1000;

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export default function AnnouncementsFeed({ emptyText }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { announcements: rows, error: loadError } = await getAnnouncements();
      if (!isMounted) return;
      if (loadError) setError(loadError.message || "Unable to load announcements.");
      else setAnnouncements(rows);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="gov-skeleton h-24 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
      >
        {error}
      </div>
    );
  }
  if (announcements.length === 0) {
    return (
      <p className="rounded-[var(--radius-md)] bg-[color:var(--gov-surface)] px-4 py-8 text-center text-sm text-[color:var(--gov-muted)]">
        {emptyText || "No announcements yet."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((item) => (
        <article
          key={item.id}
          className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-semibold text-[color:var(--gov-text)]">
              {item.title}
              {isRecent(item.created_at) ? (
                <span className="gov-badge gov-badge--info">New</span>
              ) : null}
            </p>
            <span className="shrink-0 text-xs text-[color:var(--gov-muted)]">
              {fmt(item.created_at)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-[color:var(--gov-muted)]">
            {item.body}
          </p>
        </article>
      ))}
    </div>
  );
}
