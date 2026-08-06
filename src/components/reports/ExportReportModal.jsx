import { useEffect } from "react";
import { FileDown, X } from "lucide-react";
import { DISABILITY_LABELS } from "../../constants/disability.js";

// Pick a barangay + disability type (each with an "All" option) before
// generating the age-profile PDF. `typeColumns` are the disability keys present
// in the data; `matchCount` is how many PWDs the current selection covers.
export default function ExportReportModal({
  municipalities = [],
  barangays,
  typeColumns,
  municipality = "all",
  barangay,
  type,
  // Assistance export only: pass the list to show subsidy-type + status filters.
  subsidyTypes = null,
  subsidy = "all",
  onSubsidyChange,
  status = "all",
  onStatusChange,
  matchCount,
  matchNoun = "PWD",
  onMunicipalityChange,
  onBarangayChange,
  onTypeChange,
  onExport,
  onClose,
  exporting = false,
  title = "Export report",
  subtitle = "Choose a barangay and disability type, then export the age-profile PDF.",
  ctaLabel = "Export PDF",
}) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div className="gov-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export report"
        className="gov-overlay relative w-full max-w-md p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-[color:var(--gov-muted)]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost h-10 w-10 px-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {subsidyTypes ? (
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="export-subsidy">
                Subsidy type
              </label>
              <select
                id="export-subsidy"
                value={subsidy}
                onChange={(e) => onSubsidyChange(e.target.value)}
                className="gov-input"
              >
                <option value="all">All subsidy types</option>
                {subsidyTypes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {subsidyTypes ? (
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="export-status">
                Claim status
              </label>
              <select
                id="export-status"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="gov-input"
              >
                <option value="all">Claimed &amp; unclaimed</option>
                <option value="claimed">Claimed only</option>
                <option value="unclaimed">Unclaimed only</option>
              </select>
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="export-municipality">
              Municipality
            </label>
            <select
              id="export-municipality"
              value={municipality}
              onChange={(e) => onMunicipalityChange(e.target.value)}
              className="gov-input"
            >
              <option value="all">All municipalities</option>
              {municipalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="export-barangay">
              Barangay
            </label>
            <select
              id="export-barangay"
              value={barangay}
              onChange={(e) => onBarangayChange(e.target.value)}
              className="gov-input"
            >
              <option value="all">All barangays</option>
              {barangays.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="export-type">
              Disability type
            </label>
            <select
              id="export-type"
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="gov-input"
            >
              <option value="all">All types</option>
              {typeColumns.map((t) => (
                <option key={t} value={t}>
                  {DISABILITY_LABELS[t] || "Unspecified"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {subsidyTypes && matchCount === 0 ? (
          <p className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--gov-warning-soft)] p-3 text-xs text-[color:var(--gov-warning-fg)]">
            Nothing to export. The assistance record is built from recipient
            lists, not from announcements — open the distribution under Events
            and add recipients first.
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-[color:var(--gov-border)] pt-4">
          <span className="text-sm text-[color:var(--gov-muted)]">
            {matchCount} {matchNoun}
            {matchCount === 1 ? "" : "s"} match
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={exporting || matchCount === 0}
              className="btn btn-primary"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {exporting ? "Generating…" : ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
