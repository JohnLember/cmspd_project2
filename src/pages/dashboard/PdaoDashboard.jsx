import { useEffect, useMemo, useState } from "react";
import BarChartCard from "../../components/charts/BarChartCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
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
      <section className="gov-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
          PDAO Operations Overview
        </p>
        <h2 className="text-xl font-semibold">
          Good day, PDAO team. Here is your operational snapshot.
        </h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Live application activity from the beneficiary intake form.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={isLoading ? "…" : stats.total}
          hint="All submissions"
        />
        <StatCard
          label="Pending Review"
          value={isLoading ? "…" : stats.pending}
          hint="Needs verification"
        />
        <StatCard
          label="Approved"
          value={isLoading ? "…" : stats.approved}
          hint="Validated beneficiaries"
        />
        <StatCard
          label="Rejected"
          value={isLoading ? "…" : stats.rejected}
          hint="Declined applications"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <BarChartCard title="Applications per Month" data={monthly} />
        <div className="gov-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
            Recent Activity
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            {isLoading ? (
              <li>Loading…</li>
            ) : recent.length === 0 ? (
              <li>No applications submitted yet.</li>
            ) : (
              recent.map((row) => (
                <li key={row.id}>
                  {(row.applicant_name || "An applicant") +
                    " submitted an application"}
                  <span className="text-[color:var(--gov-text)]">
                    {" "}
                    · {timeAgo(row.submitted_at)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="gov-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
          Recent Applications
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
              <tr>
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Barangay</th>
                <th className="pb-3">Submitted</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[color:var(--gov-muted)]">
                    Loading…
                  </td>
                </tr>
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[color:var(--gov-muted)]">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                recent.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[color:var(--gov-border)]"
                  >
                    <td className="py-3">{row.applicant_name || "—"}</td>
                    <td className="py-3">{row.barangay || "—"}</td>
                    <td className="py-3">{timeAgo(row.submitted_at)}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs capitalize">
                        {row.status || "pending"}
                      </span>
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
