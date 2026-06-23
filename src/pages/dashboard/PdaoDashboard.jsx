import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";
import BarChartCard from "../../components/charts/BarChartCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { getApplications } from "../../services/supabase/applications.js";

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const buildMonthlySeries = (rows) => {
  const now = new Date();
  const series = [];
  const index = new Map();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = { name: d.toLocaleString("en-US", { month: "short" }), value: 0 };
    series.push(bucket);
    index.set(key, bucket);
  }
  rows.forEach((row) => {
    if (!row.submitted_at) return;
    const d = new Date(row.submitted_at);
    const bucket = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.value += 1;
  });
  return series;
};

export default function PdaoDashboard() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { applications: rows, error: fetchError } = await getApplications();
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError.message || "Unable to load dashboard data.");
      } else {
        setApplications(rows);
      }
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const by = (status) =>
      applications.filter((row) => (row.status || "pending") === status).length;
    return {
      total: applications.length,
      pending: by("pending"),
      approved: by("approved"),
      rejected: by("rejected"),
    };
  }, [applications]);

  const monthly = useMemo(() => buildMonthlySeries(applications), [applications]);
  const recent = useMemo(() => applications.slice(0, 5), [applications]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
          Operations overview
        </h2>
        <p className="mt-1 text-[color:var(--gov-muted)]">
          Live application activity from the beneficiary intake form.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
        >
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total applications"
          value={isLoading ? "…" : stats.total}
          hint="All submissions"
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          label="Pending review"
          value={isLoading ? "…" : stats.pending}
          hint="Needs verification"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={isLoading ? "…" : stats.approved}
          hint="Validated beneficiaries"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={isLoading ? "…" : stats.rejected}
          hint="Declined applications"
          icon={XCircle}
          tone="danger"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <BarChartCard title="Applications per month" data={monthly} />
        <div className="gov-card p-5">
          <h3 className="font-semibold text-[color:var(--gov-text)]">
            Recent activity
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {isLoading ? (
              [0, 1, 2].map((i) => (
                <li key={i} className="gov-skeleton h-5 w-full" />
              ))
            ) : recent.length === 0 ? (
              <li className="text-[color:var(--gov-muted)]">
                No applications submitted yet.
              </li>
            ) : (
              recent.map((row) => (
                <li key={row.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-[color:var(--gov-text)]">
                    {row.applicant_name || "An applicant"}
                    <span className="text-[color:var(--gov-muted)]"> applied</span>
                  </span>
                  <span className="shrink-0 text-xs text-[color:var(--gov-muted)]">
                    {timeAgo(row.submitted_at)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="gov-card p-5">
        <h3 className="font-semibold text-[color:var(--gov-text)]">
          Recent applications
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                <th className="pb-3 pr-4 font-semibold">Applicant</th>
                <th className="pb-3 pr-4 font-semibold">Barangay</th>
                <th className="pb-3 pr-4 font-semibold">Submitted</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-[color:var(--gov-border)]">
                    <td colSpan={4} className="py-3">
                      <span className="gov-skeleton block h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[color:var(--gov-muted)]">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                recent.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[color:var(--gov-border)] last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{row.applicant_name || "—"}</td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {row.barangay || "—"}
                    </td>
                    <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                      {timeAgo(row.submitted_at)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={row.status || "pending"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
