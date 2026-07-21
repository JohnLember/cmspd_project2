import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { getAnnouncements } from "../../services/supabase/announcements.js";
import { getMyProfile } from "../../services/supabase/profile.js";
import { getMyWards } from "../../services/supabase/guardians.js";
import { useRealtime } from "../../hooks/useRealtime.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { fmtEventWhen } from "../../utils/eventFormat.js";
import { targetLabel } from "../../constants/disability.js";
import { announcementVisibleTo } from "../../utils/announcementTargeting.js";

const PAGE_SIZE = 10;

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

// Windowed page numbers: first, last, current ±1, with "…" gaps for big sets.
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  if (current > 3) pages.push("start-ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("end-ellipsis");
  pages.push(total);
  return pages;
}

export default function AnnouncementsFeed({ emptyText, limit, paginate = false }) {
  const { role } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  // Viewer targeting: a PWD sees announcements aimed at their own barangay/
  // disability; a guardian sees those aimed at any of their wards. `null` until
  // resolved. Only pwd/guardian feeds are filtered.
  const shouldFilter = role === "pwd" || role === "guardian";
  const [targets, setTargets] = useState(null);

  const load = useCallback(async () => {
    const { announcements: rows, error: loadError } = await getAnnouncements();
    if (loadError) setError(loadError.message || "Unable to load announcements.");
    else setAnnouncements(rows);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Resolve the viewer's targeting profile once.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (role === "pwd") {
        const { profile } = await getMyProfile();
        if (mounted) {
          setTargets([
            {
              municipality: profile?.data?.municipality,
              barangay: profile?.barangay,
              types: profile?.data?.disabilityTypes,
            },
          ]);
        }
      } else if (role === "guardian") {
        const { wards } = await getMyWards();
        if (mounted) {
          setTargets(
            (wards ?? [])
              .map((w) => w.ward)
              .filter(Boolean)
              .map((ward) => ({
                municipality: ward.data?.municipality,
                barangay: ward.barangay,
                types: ward.data?.disabilityTypes,
              }))
          );
        }
      } else if (mounted) {
        setTargets([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [role]);

  // Live updates when PDAO posts, edits, or deletes an announcement.
  useRealtime("announcements", load);

  // Only announcements aimed at this viewer (or everyone).
  const filtered = useMemo(() => {
    if (!shouldFilter) return announcements;
    if (targets === null) return announcements;
    return announcements.filter((a) => announcementVisibleTo(a, targets));
  }, [announcements, targets, shouldFilter]);

  const stillLoading = isLoading || (shouldFilter && targets === null);

  if (stillLoading) {
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
  if (filtered.length === 0) {
    return (
      <p className="rounded-[var(--radius-md)] bg-[color:var(--gov-surface)] px-4 py-8 text-center text-sm text-[color:var(--gov-muted)]">
        {emptyText || "No announcements yet."}
      </p>
    );
  }

  // Paginated (10 per page) or simple slice by `limit`.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Derive a valid page so a shrinking list never strands us on an empty page.
  const currentPage = Math.min(page, totalPages);
  const visible = paginate
    ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : limit
    ? filtered.slice(0, limit)
    : filtered;

  return (
    <div className="space-y-3">
      {visible.map((item) => (
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
          {item.item_type ||
          item.municipalities?.length ||
          item.barangays?.length ||
          targetLabel(item.disability_types) ||
          fmtEventWhen(item.event_date, item.start_time, item.end_time) ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {item.item_type ? (
                <span className="gov-badge gov-badge--success">
                  <Package className="h-3 w-3" aria-hidden="true" />
                  {item.item_type}
                </span>
              ) : null}
              {item.municipalities?.length ? (
                <span className="gov-badge gov-badge--warning">
                  Municipality: {item.municipalities.join(", ")}
                </span>
              ) : null}
              {item.barangays?.length ? (
                <span className="gov-badge gov-badge--warning">
                  Barangay: {item.barangays.join(", ")}
                </span>
              ) : null}
              {targetLabel(item.disability_types) ? (
                <span className="gov-badge gov-badge--warning">
                  For: {targetLabel(item.disability_types)}
                </span>
              ) : null}
              {fmtEventWhen(item.event_date, item.start_time, item.end_time) ? (
                <span className="gov-badge gov-badge--info">
                  When: {fmtEventWhen(item.event_date, item.start_time, item.end_time)}
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="mt-2 whitespace-pre-line text-sm text-[color:var(--gov-muted)]">
            {item.body}
          </p>
        </article>
      ))}

      {paginate && totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-2 border-t border-[color:var(--gov-border)] pt-4"
          aria-label="Announcements pages"
        >
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary h-9 px-3 text-xs"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers(currentPage, totalPages).map((p) =>
              typeof p === "number" ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`tnum grid h-9 min-w-9 place-items-center rounded-[var(--radius-md)] px-2 text-xs font-semibold transition-colors ${
                    p === currentPage
                      ? "bg-[color:var(--gov-primary)] text-[color:var(--gov-on-primary)]"
                      : "text-[color:var(--gov-muted)] hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span
                  key={p}
                  className="px-1 text-xs text-[color:var(--gov-faint)]"
                  aria-hidden="true"
                >
                  …
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary h-9 px-3 text-xs"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
