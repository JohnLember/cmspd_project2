import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getProfiles } from "../../services/supabase/profile.js";
import { disabilityLabel } from "../../constants/disability.js";
import PwdDetailModal from "../../components/pwd/PwdDetailModal.jsx";

const displayId = (row) =>
  row.application?.application_number || `PWD-${row.id.slice(0, 8).toUpperCase()}`;

export default function PwdManagement() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { profiles: rows, error: fetchError } = await getProfiles();
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError.message || "Unable to load PWD profiles.");
      } else {
        setProfiles(rows);
      }
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

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
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              PWD Management
            </p>
            <h2 className="text-xl font-semibold">Registered PWD Profiles</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Manage profiles, verify requirements, and monitor PWD assistance
              status.
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold text-[color:var(--gov-muted)]">
            {profiles.length} registered
          </span>
        </div>
      </section>

      <section className="gov-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm"
            />
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm"
            >
              <option value="all">All barangays</option>
              {barangays.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <Link
            to="/beneficiary-apply"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]"
          >
            View beneficiary intake
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
              <tr>
                <th className="pb-3">PWD ID</th>
                <th className="pb-3">Full name</th>
                <th className="pb-3">Barangay</th>
                <th className="pb-3">Disability</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--gov-muted)]">
                    Loading profiles…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--gov-muted)]">
                    {profiles.length === 0
                      ? "No registered PWD profiles yet. Approve an application to create one."
                      : "No profiles match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[color:var(--gov-border)]"
                  >
                    <td className="py-3 font-mono text-xs">{displayId(row)}</td>
                    <td className="py-3">{row.full_name || "—"}</td>
                    <td className="py-3">{row.barangay || "—"}</td>
                    <td className="py-3">
                      {disabilityLabel(row.data?.disabilityTypes)}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="text-xs font-semibold text-[color:var(--gov-accent)]"
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
