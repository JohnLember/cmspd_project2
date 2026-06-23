import { useEffect } from "react";
import { DISABILITY_LABELS } from "../../constants/disability.js";

export default function ExportReportModal({
  barangays,
  typeColumns,
  barangay,
  type,
  matchCount,
  onBarangayChange,
  onTypeChange,
  onExport,
  onClose,
}) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div
        className="gov-backdrop absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export report"
        className="gov-overlay relative w-full max-w-md p-6"
      >
        <h3 className="text-lg font-semibold">Export report (CSV)</h3>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
          Choose which registered PWDs to export.
        </p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[color:var(--gov-text)]">
              Barangay
            </label>
            <select
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
            <label className="mb-1 block text-sm font-medium text-[color:var(--gov-text)]">
              Disability type
            </label>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="gov-input"
            >
              <option value="all">All disability types</option>
              {typeColumns.map((t) => (
                <option key={t} value={t}>
                  {DISABILITY_LABELS[t] || "Unspecified"}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-[color:var(--gov-muted)]">
            {matchCount} record{matchCount === 1 ? "" : "s"} match this selection.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={matchCount === 0}
            className="btn btn-primary"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
