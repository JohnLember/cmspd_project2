import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { getAnnouncements } from "../../services/supabase/announcements.js";
import { useRealtime } from "../../hooks/useRealtime.js";
import { fmtEventDate, fmtTimeRange } from "../../utils/eventFormat.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ymd = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function Events() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const { announcements: rows, error: loadError } = await getAnnouncements();
    if (loadError) setError(loadError.message || "Unable to load events.");
    else setAnnouncements(rows);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live: new/edited/deleted announcements update the calendar in place.
  useRealtime("announcements", load);

  // Map "YYYY-MM-DD" -> announcements scheduled that day (those with a When date).
  const byDay = useMemo(() => {
    const map = {};
    for (const a of announcements) {
      if (!a.event_date) continue;
      (map[a.event_date] ??= []).push(a);
    }
    return map;
  }, [announcements]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const monthLabel = cursor.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
  const eventCount = Object.values(byDay).reduce((n, list) => n + list.length, 0);
  const selectedEvents = selected ? byDay[selected] ?? [] : [];

  const goPrev = () => {
    setCursor(new Date(year, month - 1, 1));
    setSelected(null);
  };
  const goNext = () => {
    setCursor(new Date(year, month + 1, 1));
    setSelected(null);
  };
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(todayKey);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.01em]">
            <CalendarDays
              className="h-6 w-6 text-[color:var(--gov-primary)]"
              aria-hidden="true"
            />
            Events
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Announcements plotted on the calendar by their event date.
          </p>
        </div>
        <span className="gov-badge gov-badge--neutral">
          {eventCount} scheduled
        </span>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
        >
          {error}
        </div>
      ) : null}

      <section className="gov-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[color:var(--gov-text)]">
            {monthLabel}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToday}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goPrev}
              className="btn btn-secondary h-9 w-9 px-0"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="btn btn-secondary h-9 w-9 px-0"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 gov-skeleton h-80 w-full" />
        ) : (
          <>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[color:var(--gov-muted)]">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`blank-${idx}`} className="min-h-16" />;
                }
                const key = ymd(year, month, day);
                const events = byDay[key] ?? [];
                const isToday = key === todayKey;
                const isSelected = key === selected;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setSelected(isSelected ? null : key)
                    }
                    className={`flex min-h-16 flex-col rounded-[var(--radius-md)] border p-1.5 text-left transition-colors ${
                      isSelected
                        ? "border-[color:var(--gov-primary)] bg-[color:var(--gov-primary-soft)]"
                        : "border-[color:var(--gov-border)] hover:bg-[color:var(--gov-card)]"
                    }`}
                    aria-label={`${fmtEventDate(key)}${
                      events.length ? `, ${events.length} event(s)` : ""
                    }`}
                  >
                    <span
                      className={`tnum grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-[color:var(--gov-primary)] text-[color:var(--gov-on-primary)]"
                          : "text-[color:var(--gov-text)]"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {events.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className="block truncate rounded bg-[color:var(--gov-info-soft)] px-1 py-0.5 text-[10px] font-medium text-[color:var(--gov-info-fg)]"
                          title={e.title}
                        >
                          {e.title}
                        </span>
                      ))}
                      {events.length > 2 ? (
                        <span className="block px-1 text-[10px] text-[color:var(--gov-muted)]">
                          +{events.length - 2} more
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {selected ? (
        <section className="gov-card p-5">
          <h3 className="font-semibold text-[color:var(--gov-text)]">
            {fmtEventDate(selected)}
          </h3>
          <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
            Click an event to manage it and its recipients.
          </p>
          {selectedEvents.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
              No events on this day.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {selectedEvents.map((e) => (
                <Link
                  key={e.id}
                  to={`/app/events/${e.id}`}
                  className="group card-press block rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4 hover:border-[color:var(--gov-primary)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[color:var(--gov-text)]">
                        {e.title}
                      </p>
                      {e.item_type ? (
                        <span className="gov-badge gov-badge--info">
                          <Package className="h-3 w-3" aria-hidden="true" />
                          {e.item_type}
                        </span>
                      ) : null}
                      {fmtTimeRange(e.start_time, e.end_time) ? (
                        <span className="gov-badge gov-badge--neutral">
                          {fmtTimeRange(e.start_time, e.end_time)}
                        </span>
                      ) : null}
                    </div>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-[color:var(--gov-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--gov-primary)] motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--gov-muted)]">
                    {e.body}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
