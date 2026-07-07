// Formatting helpers for announcement event date/time. Event date is a plain
// "YYYY-MM-DD" and times are "HH:MM[:SS]" — render them without timezone shifts.

export function fmtEventDate(ymd) {
  if (!ymd) return "";
  const [y, m, d] = String(ymd).split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function fmtTime(hms) {
  if (!hms) return "";
  const [h, min] = String(hms).split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(min || 0).padStart(2, "0")} ${period}`;
}

export function fmtTimeRange(start, end) {
  const s = fmtTime(start);
  const e = fmtTime(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

// Combined "date, time-range" string for compact display. Empty if neither set.
export function fmtEventWhen(date, start, end) {
  const parts = [];
  const d = fmtEventDate(date);
  if (d) parts.push(d);
  const range = fmtTimeRange(start, end);
  if (range) parts.push(range);
  return parts.join(", ");
}
