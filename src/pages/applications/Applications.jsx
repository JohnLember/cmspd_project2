import { useEffect, useMemo, useState } from "react";
import {
  approveApplication,
  getApplications,
  updateApplicationStatus,
} from "../../services/supabase/applications.js";
import ApproveApplicationModal from "../../components/applications/ApproveApplicationModal.jsx";

const STATUS_OPTIONS = ["pending", "approved", "rejected"];

const typeLabel = (value) =>
  value === "renewal" ? "Renewal" : value === "new" ? "New Applicant" : "—";

const displayId = (row) =>
  row.application_number || `APP-${row.id.slice(0, 8).toUpperCase()}`;

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { applications: rows, error: fetchError } = await getApplications();
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError.message || "Unable to load applications.");
      } else {
        setApplications(rows);
      }
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((row) => {
      const appType = row.data?.appType ?? "";
      const matchesSearch =
        !term ||
        (row.applicant_name || "").toLowerCase().includes(term) ||
        displayId(row).toLowerCase().includes(term);
      const matchesType = typeFilter === "all" || appType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || (row.status || "pending") === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [applications, search, typeFilter, statusFilter]);

  const rollback = (id, previous) =>
    setApplications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: previous } : item))
    );

  const handleStatusChange = async (row, status) => {
    setError("");
    setNotice("");
    if (status === "approved") {
      // Approval requires the signature + officers modal; defer until confirm.
      setApproveError("");
      setApproveTarget(row);
      return;
    }
    const previous = row.status;
    setUpdatingId(row.id);
    setApplications((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, status } : item))
    );
    const { error: updateError } = await updateApplicationStatus(row.id, status);
    if (updateError) {
      rollback(row.id, previous);
      setError(updateError.message || "Unable to update status.");
    }
    setUpdatingId(null);
  };

  const handleConfirmApprove = async (details) => {
    if (!approveTarget) return;
    setApproveError("");
    setIsApproving(true);
    const { result, error: approveErr } = await approveApplication(
      approveTarget.id,
      details
    );
    if (approveErr) {
      setApproveError(approveErr.message || "Unable to approve application.");
      setIsApproving(false);
      return;
    }
    setApplications((prev) =>
      prev.map((item) =>
        item.id === approveTarget.id ? { ...item, status: "approved" } : item
      )
    );
    setNotice(
      `Approved. PWD account created for ${
        approveTarget.applicant_name || "applicant"
      } — email: ${result.email} · temporary password: ${result.password}`
    );
    setIsApproving(false);
    setApproveTarget(null);
  };

  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Application Management
            </p>
            <h2 className="text-xl font-semibold">PWD Applications Queue</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Review submitted applications, verify requirements, and update
              statuses.
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold text-[color:var(--gov-muted)]">
            {applications.length} total
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm"
            >
              <option value="all">All types</option>
              <option value="new">New Applicant</option>
              <option value="renewal">Renewal</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
              <tr>
                <th className="pb-3">Application ID</th>
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Barangay</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--gov-muted)]">
                    Loading applications…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--gov-muted)]">
                    {applications.length === 0
                      ? "No applications submitted yet."
                      : "No applications match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[color:var(--gov-border)]"
                  >
                    <td className="py-3 font-mono text-xs">{displayId(row)}</td>
                    <td className="py-3">{row.applicant_name || "—"}</td>
                    <td className="py-3">{typeLabel(row.data?.appType)}</td>
                    <td className="py-3">{row.barangay || "—"}</td>
                    <td className="py-3">
                      <select
                        value={row.status || "pending"}
                        disabled={updatingId === row.id}
                        onChange={(e) => handleStatusChange(row, e.target.value)}
                        className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-1 text-xs disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {approveTarget ? (
        <ApproveApplicationModal
          applicantName={approveTarget.applicant_name}
          isSubmitting={isApproving}
          error={approveError}
          onCancel={() => {
            if (!isApproving) setApproveTarget(null);
          }}
          onConfirm={handleConfirmApprove}
        />
      ) : null}
    </div>
  );
}
