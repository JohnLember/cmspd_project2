import { useEffect } from "react";
import { X } from "lucide-react";
import AccountCredentials from "../ui/AccountCredentials.jsx";

const wardLabel = (w) =>
  w.full_name || w.pwd_id_number || `PWD-${(w.id || "").slice(0, 8).toUpperCase()}`;

const Row = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-[color:var(--gov-muted)]">{label}</p>
    <p className="mt-1 text-sm text-[color:var(--gov-text)]">{value || "—"}</p>
  </div>
);

export default function GuardianDetailModal({ guardian, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!guardian) return null;
  const initials =
    (guardian.name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "G";
  const active = guardian.active !== false;

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
        aria-label={`Profile of ${guardian.name || "guardian"}`}
        className="gov-overlay relative max-h-[92vh] w-full max-w-xl overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gov-primary)] text-base font-semibold text-[color:var(--gov-on-primary)]">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{guardian.name || "—"}</h2>
              <span
                className={`gov-badge ${
                  active ? "gov-badge--success" : "gov-badge--danger"
                }`}
              >
                {active ? "Active" : "Deactivated"}
              </span>
            </div>
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Row label="Mobile number" value={guardian.phone} />
          <Row label="Login email" value={guardian.email} />
        </div>

        <AccountCredentials targetId={guardian.guardianId} type="guardian" />

        <div className="mt-8">
          <h3 className="font-semibold text-[color:var(--gov-text)]">
            Linked wards ({guardian.wards?.length ?? 0})
          </h3>
          <div className="mt-3 space-y-2">
            {(guardian.wards ?? []).length === 0 ? (
              <p className="text-sm text-[color:var(--gov-muted)]">
                No wards linked.
              </p>
            ) : (
              guardian.wards.map((w) => (
                <div
                  key={w.linkId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{wardLabel(w)}</p>
                    <p className="text-xs text-[color:var(--gov-muted)]">
                      {w.barangay || "—"}
                      {w.relationship ? ` · ${w.relationship}` : ""}
                    </p>
                  </div>
                  {w.active === false ? (
                    <span className="gov-badge gov-badge--danger">
                      Deactivated
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
