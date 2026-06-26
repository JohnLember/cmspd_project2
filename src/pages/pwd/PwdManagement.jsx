import { useCallback, useEffect, useMemo, useState } from "react";
import { getProfiles } from "../../services/supabase/profile.js";
import { disabilityLabel } from "../../constants/disability.js";
import PwdDetailModal from "../../components/pwd/PwdDetailModal.jsx";
import { useRealtime } from "../../hooks/useRealtime.js";

const displayId = (row) =>
  row.pwd_id_number ||
  row.application?.application_number ||
  `PWD-${row.id.slice(0, 8).toUpperCase()}`;

export default function PwdManagement() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const { profiles: rows, error: fetchError } = await getProfiles();
    if (fetchError) {
      setError(fetchError.message || "Unable to load PWD profiles.");
    } else {
      setProfiles(rows);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live: profiles appear/update as applications are approved or records change.
  useRealtime("profiles", load);

  const barangays = useMemo(() => {
    const set = new Set(
      profiles.map((p) => p.barangay).filter((b) => b && b.trim())
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [profiles]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter((row) => {
      const matchesSearch =
        !term ||
        (row.full_name || "").toLowerCase().includes(term) ||
        displayId(row).toLowerCase().includes(term);
      const matchesBarangay =
        barangayFilter === "all" || row.barangay === barangayFilter;
      return matchesSearch && matchesBarangay;
    });
  }, [profiles, search, barangayFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            Registered PWD profiles
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Manage profiles, verify requirements, and monitor PWD assistance status.
          </p>
        </div>
        <span className="gov-badge gov-badge--neutral">
          {profiles.length} registered
        </span>
      </header>

      <section className="gov-card p-5">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID"
            className="gov-input w-full sm:max-w-xs"
          />
          <select
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="gov-input w-full sm:w-auto"
          >
            <option value="all">All barangays</option>
            {barangays.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
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
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                <th className="pb-3 pr-4 font-semibold">PWD ID</th>
                <th className="pb-3 pr-4 font-semibold">Full name</th>
                <th className="pb-3 pr-4 font-semibold">Barangay</th>
                <th className="pb-3 pr-4 font-semibold">Disability</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-[color:var(--gov-border)]">
                    <td colSpan={5} className="py-3">
                      <span className="gov-skeleton block h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[color:var(--gov-muted)]">
                    {profiles.length === 0
                      ? "No registered PWD profiles yet. Approve an application to create one."
                      : "No profiles match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[color:var(--gov-border)] last:border-0"
                  >
                    <td className="py-3 pr-4 font-mono text-xs">{displayId(row)}</td>
                    <td className="py-3 pr-4 font-medium">{row.full_name || "—"}</td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {row.barangay || "—"}
                    </td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {disabilityLabel(row.data?.disabilityTypes)}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="btn btn-ghost h-9 px-3 text-xs"
                      >
                        View profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading ? (
          <div className="mt-4 text-xs text-[color:var(--gov-muted)]">
            Showing {filtered.length} of {profiles.length} profiles
          </div>
        ) : null}
      </section>

      {selected ? (
        <PwdDetailModal profile={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
