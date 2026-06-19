import { DISABILITY_LABELS } from "../../constants/disability.js";

const selectClass =
  "mt-1 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-2 text-sm";

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
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="gov-card w-full max-w-md rounded-3xl p-6">
        <h3 className="text-lg font-semibold">Export report (CSV)</h3>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
          Choose which registered PWDs to export.
        </p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              Barangay
            </label>
            <select
              value={barangay}
              onChange={(e) => onBarangayChange(e.target.value)}
              className={selectClass}
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
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              Disability type
            </label>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">All disability types</option>
              {typeColumns.map((t) => (
                <option key={t} value={t}>
                  {DISABILITY_LABELS[t] || "Unspecified"}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-[color:var(--gov-muted)]">
            {matchCount} record{matchCount === 1 ? "" : "s"} match this selection.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={matchCount === 0}
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
