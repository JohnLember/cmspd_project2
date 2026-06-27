import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getAllGuardians } from "../../services/supabase/guardians.js";
import { setAccountStatus } from "../../services/supabase/accounts.js";
import GuardianDetailModal from "../../components/guardians/GuardianDetailModal.jsx";
import { useRealtime } from "../../hooks/useRealtime.js";

const wardLabel = (w) =>
  w.full_name || w.pwd_id_number || `PWD-${(w.id || "").slice(0, 8).toUpperCase()}`;

export default function GuardianManagement() {
  const [guardians, setGuardians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    const { guardians: rows, error: fetchError } = await getAllGuardians();
    if (fetchError) {
      setError(fetchError.message || "Unable to load guardians.");
    } else {
      setGuardians(rows);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live: new links appear as applications with guardians are approved.
  useRealtime("guardian_ward_links", load);

  const doToggle = async (g) => {
    const next = g.active === false; // currently inactive -> activating
    setTogglingId(g.guardianId);
    const { error: toggleError } = await setAccountStatus({
      targetId: g.guardianId,
      type: "guardian",
      active: next,
    });
    if (toggleError) {
      toast.error(toggleError.message || "Unable to update account status.");
    } else {
      setGuardians((prev) =>
        prev.map((x) =>
          x.guardianId === g.guardianId ? { ...x, active: next } : x
        )
      );
      toast.success(next ? "Account activated." : "Account deactivated.");
    }
    setTogglingId(null);
  };

  const confirmToggle = (g) => {
    const deactivating = g.active !== false;
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">
            {deactivating ? "Deactivate account?" : "Activate account?"}
          </p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            {deactivating
              ? `${g.name || "This guardian"} will be signed out and blocked from logging in until reactivated.`
              : `${g.name || "This guardian"} will be able to log in again.`}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                doToggle(g);
                closeToast();
              }}
              className={`btn h-9 px-3 text-xs ${
                deactivating ? "btn-danger" : "btn-primary"
              }`}
            >
              {deactivating ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ),
      {
        toastId: `guardian-status-${g.guardianId}`,
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: "gov-card",
      }
    );
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return guardians;
    return guardians.filter(
      (g) =>
        (g.name || "").toLowerCase().includes(term) ||
        (g.email || "").toLowerCase().includes(term) ||
        (g.phone || "").toLowerCase().includes(term) ||
        g.wards.some((w) => wardLabel(w).toLowerCase().includes(term))
    );
  }, [guardians, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            Guardian accounts
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Guardians and the PWD wards linked to each account. Accounts are
            created when an application listing a guardian is approved.
          </p>
        </div>
        <span className="gov-badge gov-badge--neutral">
          {guardians.length} guardian{guardians.length === 1 ? "" : "s"}
        </span>
      </header>

      <section className="gov-card p-5">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guardian, ward, email, or mobile"
            className="gov-input w-full sm:max-w-sm"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                <th className="pb-3 pr-4 font-semibold">Guardian</th>
                <th className="pb-3 pr-4 font-semibold">Mobile</th>
                <th className="pb-3 pr-4 font-semibold">Login email</th>
                <th className="pb-3 pr-4 font-semibold">Wards</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-[color:var(--gov-border)]">
                    <td colSpan={6} className="py-3">
                      <span className="gov-skeleton block h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-[color:var(--gov-muted)]"
                  >
                    {guardians.length === 0
                      ? "No guardian accounts yet. Approve an application that lists a guardian to create one."
                      : "No guardians match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr
                    key={g.guardianId}
                    className="border-b border-[color:var(--gov-border)] align-top last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{g.name || "—"}</td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {g.phone || "—"}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-[color:var(--gov-muted)]">
                      {g.email || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {g.wards.length === 0 ? (
                        <span className="text-[color:var(--gov-muted)]">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {g.wards.map((w) => (
                            <span
                              key={w.linkId}
                              className="gov-badge gov-badge--neutral"
                              title={
                                w.relationship
                                  ? `${wardLabel(w)} · ${w.relationship}`
                                  : wardLabel(w)
                              }
                            >
                              {wardLabel(w)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {g.active === false ? (
                        <span className="gov-badge gov-badge--danger">
                          Deactivated
                        </span>
                      ) : (
                        <span className="gov-badge gov-badge--success">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(g)}
                          className="btn btn-ghost h-9 px-3 text-xs"
                        >
                          View profile
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmToggle(g)}
                          disabled={togglingId === g.guardianId}
                          className={`btn h-9 px-3 text-xs ${
                            g.active === false ? "btn-secondary" : "btn-danger"
                          }`}
                        >
                          {togglingId === g.guardianId
                            ? "…"
                            : g.active === false
                            ? "Activate"
                            : "Deactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading ? (
          <div className="mt-4 text-xs text-[color:var(--gov-muted)]">
            Showing {filtered.length} of {guardians.length} guardians
          </div>
        ) : null}
      </section>

      {selected ? (
        <GuardianDetailModal
          guardian={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
