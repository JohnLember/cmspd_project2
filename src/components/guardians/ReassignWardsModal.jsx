import { useMemo, useState } from "react";
import { Copy, X } from "lucide-react";
import { toast } from "react-toastify";
import { reassignWard } from "../../services/supabase/guardians.js";

const copyText = async (value, label) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`, { autoClose: 1500 });
  } catch {
    toast.error("Unable to copy.");
  }
};

const wardLabel = (w) =>
  w.full_name || w.pwd_id_number || `PWD-${(w.id || "").slice(0, 8).toUpperCase()}`;

const NEW = "__new__";

// Before a guardian with wards can be deleted, each ward must be reassigned to
// another guardian (an existing account, or a brand-new one created here).
export default function ReassignWardsModal({
  guardian,
  otherGuardians,
  onCancel,
  onDone,
}) {
  const wards = useMemo(() => guardian?.wards ?? [], [guardian]);
  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      wards.map((w) => [
        w.id,
        { target: "", firstName: "", middleName: "", lastName: "", relationship: "" },
      ])
    )
  );
  const [busy, setBusy] = useState(false);
  const [createdCreds, setCreatedCreds] = useState([]);

  const setRow = (wardId, patch) =>
    setRows((prev) => ({ ...prev, [wardId]: { ...prev[wardId], ...patch } }));

  const ready = useMemo(
    () =>
      wards.every((w) => {
        const r = rows[w.id];
        if (!r || !r.target) return false;
        if (r.target === NEW) return r.firstName.trim() && r.lastName.trim();
        return true;
      }),
    [wards, rows]
  );

  const handleConfirm = async () => {
    if (!ready) return;
    setBusy(true);
    const created = [];
    for (const w of wards) {
      const r = rows[w.id];
      const payload =
        r.target === NEW
          ? {
              pwdId: w.id,
              mode: "new",
              newGuardian: {
                firstName: r.firstName.trim(),
                middleName: r.middleName.trim(),
                lastName: r.lastName.trim(),
                relationship: r.relationship.trim() || null,
              },
            }
          : {
              pwdId: w.id,
              mode: "existing",
              guardian: otherGuardians.find((g) => g.guardianId === r.target),
            };
      const { error, created: cred } = await reassignWard(payload);
      if (error) {
        toast.error(
          `Could not reassign ${wardLabel(w)}: ${error.message || "error"}.`
        );
        setBusy(false);
        return;
      }
      if (cred?.email) {
        created.push({ ward: wardLabel(w), email: cred.email, password: cred.password });
      }
    }
    setBusy(false);
    // Show the new guardians' temporary logins before finishing the delete.
    if (created.length) setCreatedCreds(created);
    else onDone();
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div className="gov-backdrop absolute inset-0" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reassign wards"
        className="gov-overlay relative max-h-[92vh] w-full max-w-2xl overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Reassign wards before deleting</h2>
            <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
              {guardian?.name || "This guardian"} still wards{" "}
              {wards.length} PWD{wards.length === 1 ? "" : "s"}. Assign each to
              another guardian to continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn btn-ghost h-10 w-10 px-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {createdCreds.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-[color:var(--gov-text)]">
              New guardian account{createdCreds.length === 1 ? "" : "s"} created.
              Share these temporary logins before finishing.
            </p>
            {createdCreds.map((c) => (
              <div
                key={c.email}
                className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4"
              >
                <p className="text-xs font-medium text-[color:var(--gov-muted)]">
                  For {c.ward}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-sm text-[color:var(--gov-text)]">
                    {c.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(c.email, "Login email")}
                    className="btn btn-ghost h-8 w-8 px-0"
                    aria-label="Copy login email"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm text-[color:var(--gov-text)]">
                    {c.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(c.password, "Password")}
                    className="btn btn-ghost h-8 w-8 px-0"
                    aria-label="Copy password"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="mt-5 space-y-4">
          {wards.map((w) => {
            const r = rows[w.id];
            return (
              <div
                key={w.id}
                className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4"
              >
                <p className="text-sm font-medium text-[color:var(--gov-text)]">
                  {wardLabel(w)}
                </p>
                <label className="mt-2 block text-xs font-medium text-[color:var(--gov-muted)]">
                  New guardian
                </label>
                <select
                  value={r.target}
                  onChange={(e) => setRow(w.id, { target: e.target.value })}
                  className="gov-input mt-1"
                >
                  <option value="" disabled>
                    Select a guardian…
                  </option>
                  {otherGuardians.map((g) => (
                    <option key={g.guardianId} value={g.guardianId}>
                      {g.name || g.email || "Guardian"}
                    </option>
                  ))}
                  <option value={NEW}>+ Create new guardian…</option>
                </select>

                {r.target === NEW ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={r.firstName}
                      onChange={(e) => setRow(w.id, { firstName: e.target.value })}
                      placeholder="First name"
                      className="gov-input"
                    />
                    <input
                      type="text"
                      value={r.middleName}
                      onChange={(e) => setRow(w.id, { middleName: e.target.value })}
                      placeholder="Middle name"
                      className="gov-input"
                    />
                    <input
                      type="text"
                      value={r.lastName}
                      onChange={(e) => setRow(w.id, { lastName: e.target.value })}
                      placeholder="Last name"
                      className="gov-input"
                    />
                    <input
                      type="text"
                      value={r.relationship}
                      onChange={(e) =>
                        setRow(w.id, { relationship: e.target.value })
                      }
                      placeholder="Relationship (optional)"
                      className="gov-input sm:col-span-3"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          {createdCreds.length > 0 ? (
            <button
              type="button"
              onClick={onDone}
              className="btn btn-primary"
            >
              Finish & delete
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!ready || busy}
                className="btn btn-primary"
              >
                {busy ? "Reassigning…" : "Reassign & delete"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
