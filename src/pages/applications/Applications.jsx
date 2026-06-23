import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  approveApplication,
  getApplications,
  updateApplicationStatus,
} from "../../services/supabase/applications.js";
import ApproveApplicationModal from "../../components/applications/ApproveApplicationModal.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";

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
    const guardianLine = result.guardian
      ? ` · Guardian account — email: ${result.guardian.email} · password: ${result.guardian.password}`
      : "";
    setNotice(
      `Approved. PWD account for ${
        approveTarget.applicant_name || "applicant"
      } — email: ${result.email} · temporary password: ${result.password}${guardianLine}`
    );
    setIsApproving(false);
    setApproveTarget(null);
  };

  const confirmReject = (row) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Reject application?</p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            Reject {row.applicant_name || "this applicant"}’s application? You can
            reconsider it later.
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
                handleStatusChange(row, "rejected");
                closeToast();
              }}
              className="btn btn-danger h-9 px-3 text-xs"
            >
              Reject
            </button>
          </div>
        </div>
      ),
      {
        toastId: `reject-${row.id}`,
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: "gov-card",
      }
    );
  };

  // Status is a lifecycle, not a free toggle: pending → Approve/Reject;
  // approved is locked (it provisioned accounts); rejected can be reconsidered.
  const renderStatus = (row) => {
    const status = row.status || "pending";
    const busy = updatingId === row.id;

    if (status === "approved") {
      return <StatusBadge status="approved" />;
    }
    if (status === "rejected") {
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status="rejected" />
          <button
            type="button"
            disabled={busy}
            onClick={() => handleStatusChange(row, "pending")}
            className="btn btn-ghost h-9 px-3 text-xs"
          >
            Reconsider
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleStatusChange(row, "approved")}
          className="btn btn-primary h-9 px-3 text-xs"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => confirmReject(row)}
          className="btn btn-secondary h-9 px-3 text-xs"
        >
          Reject
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            Applications queue
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Review submitted applications, verify requirements, and update statuses.
          </p>
        </div>
        <span className="gov-badge gov-badge--neutral">
          {applications.length} total
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="gov-input w-full sm:w-auto"
          >
            <option value="all">All types</option>
            <option value="new">New Applicant</option>
            <option value="renewal">Renewal</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="gov-input w-full sm:w-auto"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
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

        {notice ? (
          <div
            role="status"
            className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--gov-success-soft)] px-4 py-3 text-sm text-[color:var(--gov-success-fg)]"
          >
            {notice}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                <th className="pb-3 pr-4 font-semibold">Application ID</th>
                <th className="pb-3 pr-4 font-semibold">Applicant</th>
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Barangay</th>
                <th className="pb-3 font-semibold">Status</th>
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
                    {applications.length === 0
                      ? "No applications submitted yet."
                      : "No applications match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[color:var(--gov-border)] last:border-0"
                  >
                    <td className="py-3 pr-4 font-mono text-xs">{displayId(row)}</td>
                    <td className="py-3 pr-4 font-medium">{row.applicant_name || "—"}</td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {typeLabel(row.data?.appType)}
                    </td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {row.barangay || "—"}
                    </td>
                    <td className="py-3">{renderStatus(row)}</td>
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
