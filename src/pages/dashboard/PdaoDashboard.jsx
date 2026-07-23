import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Clock, CheckCircle2, Users } from "lucide-react";
import BarChartCard from "../../components/charts/BarChartCard.jsx";
import StackedBarChartCard from "../../components/charts/StackedBarChartCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import PendingApplicantsModal from "../../components/dashboard/PendingApplicantsModal.jsx";
import { getApplications } from "../../services/supabase/applications.js";
import { getProfiles } from "../../services/supabase/profile.js";
import {
  DISABILITY_COLORS,
  DISABILITY_LABELS,
} from "../../constants/disability.js";
import { useRealtime } from "../../hooks/useRealtime.js";
import { profileMunicipality } from "../../utils/locality.js";

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

// year=null → rolling last 6 months; year=YYYY → that year's Jan–Dec.
const buildMonthlySeries = (rows, year) => {
  const series = [];
  const index = new Map();
  if (year) {
    for (let m = 0; m < 12; m += 1) {
      const bucket = {
        name: new Date(year, m, 1).toLocaleString("en-US", { month: "short" }),
        value: 0,
      };
      series.push(bucket);
      index.set(`${year}-${m}`, bucket);
    }
  } else {
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const bucket = { name: d.toLocaleString("en-US", { month: "short" }), value: 0 };
      series.push(bucket);
      index.set(`${d.getFullYear()}-${d.getMonth()}`, bucket);
    }
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
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState("all");
  const [showPending, setShowPending] = useState(false);
  const [chartMunicipality, setChartMunicipality] = useState("all");

  const load = useCallback(async () => {
    const [appsRes, profilesRes] = await Promise.all([
      getApplications(),
      getProfiles(),
    ]);
    if (appsRes.error) {
      setError(appsRes.error.message || "Unable to load dashboard data.");
    } else {
      setApplications(appsRes.applications);
    }
    if (!profilesRes.error) {
      setProfiles(profilesRes.profiles);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live stats and recent activity as applications come in and change status.
  useRealtime("applications", load);
  // Live disability distribution as profiles are created/updated.
  useRealtime("profiles", load);

  // Year filter: fixed rolling 5-years-back range, not just years with data,
  // so the dropdown stays stable regardless of what's been submitted yet.
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  }, []);

  const apps = useMemo(
    () =>
      year === "all"
        ? applications
        : applications.filter(
            (r) => r.submitted_at && new Date(r.submitted_at).getFullYear() === Number(year)
          ),
    [applications, year]
  );
  const profs = useMemo(
    () =>
      year === "all"
        ? profiles
        : profiles.filter(
            (p) => p.created_at && new Date(p.created_at).getFullYear() === Number(year)
          ),
    [profiles, year]
  );

  const stats = useMemo(() => {
    const by = (status) =>
      apps.filter((row) => (row.status || "pending") === status).length;
    // "Approved" mirrors Registered PWDs: only approved apps whose beneficiary
    // still has a live profile, so deactivating/deleting a PWD drops both counts
    // together and the two cards never disagree.
    const liveProfileIds = new Set(profs.map((p) => p.id));
    const approved = apps.filter(
      (row) => row.status === "approved" && liveProfileIds.has(row.pwd_id)
    ).length;
    return {
      total: apps.length,
      pending: by("pending"),
      approved,
    };
  }, [apps, profs]);

  const monthly = useMemo(
    () => buildMonthlySeries(apps, year === "all" ? null : Number(year)),
    [apps, year]
  );
  const recent = useMemo(() => apps.slice(0, 5), [apps]);

  // All pending applications across every year; the modal has its own filters.
  const pendingApps = useMemo(
    () => applications.filter((r) => (r.status || "pending") === "pending"),
    [applications]
  );

  // Municipalities present, for the chart drill-down selector.
  const chartMunicipalities = useMemo(() => {
    const set = new Set(
      profs.map((p) => p.data?.municipality).filter((m) => m && m.trim())
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [profs]);

  // Registered PWDs split by disability type. Grouped by MUNICIPALITY across the
  // province; when one municipality is selected, drill down to its barangays.
  const disabilityByLocality = useMemo(() => {
    const scoped =
      chartMunicipality === "all"
        ? profs
        : profs.filter((p) => profileMunicipality(p) === chartMunicipality);
    const groupKey = (p) =>
      chartMunicipality === "all"
        ? profileMunicipality(p)
        : (p.barangay || "").trim() || "Unspecified";

    const byGroup = {}; // group -> { name, [type]: count }
    const typeSet = new Set();
    scoped.forEach((p) => {
      const key = groupKey(p);
      byGroup[key] ??= { name: key };
      const types = Array.isArray(p.data?.disabilityTypes)
        ? p.data.disabilityTypes
        : [];
      const effective = types.length ? types : ["unspecified"];
      effective.forEach((t) => {
        typeSet.add(t);
        byGroup[key][t] = (byGroup[key][t] || 0) + 1;
      });
    });
    const known = Object.keys(DISABILITY_LABELS).filter((t) => typeSet.has(t));
    const extras = Array.from(typeSet)
      .filter((t) => !DISABILITY_LABELS[t] && t !== "unspecified")
      .sort();
    const orderedTypes = [...known, ...extras];
    if (typeSet.has("unspecified")) orderedTypes.push("unspecified");
    const series = orderedTypes.map((t) => ({
      key: t,
      label: t === "unspecified" ? "Unspecified" : DISABILITY_LABELS[t] || t,
      color: DISABILITY_COLORS[t] || "#94a3b8",
    }));
    const data = Object.values(byGroup).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return { data, series };
  }, [profs, chartMunicipality]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            Operations overview
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Live application activity from the beneficiary intake form.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[color:var(--gov-muted)]">
          Year
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="gov-card rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-2 text-sm text-[color:var(--gov-text)]"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
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
          label="Registered PWDs"
          value={isLoading ? "…" : profs.length}
          hint="Approved beneficiaries"
          icon={Users}
          tone="primary"
        />
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
          hint="Needs verification — view list"
          icon={Clock}
          tone="warning"
          onClick={() => setShowPending(true)}
        />
        <StatCard
          label="Approved"
          value={isLoading ? "…" : stats.approved}
          hint="Validated beneficiaries"
          icon={CheckCircle2}
          tone="success"
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

      <section className="space-y-3">
        <div className="flex justify-end">
          <label className="flex items-center gap-2 text-sm text-[color:var(--gov-muted)]">
            Municipality
            <select
              value={chartMunicipality}
              onChange={(e) => setChartMunicipality(e.target.value)}
              className="gov-card rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-2 text-sm text-[color:var(--gov-text)]"
            >
              <option value="all">All municipalities</option>
              {chartMunicipalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <StackedBarChartCard
          title={
            chartMunicipality === "all"
              ? "Registered PWDs per municipality by disability type"
              : `Registered PWDs in ${chartMunicipality} per barangay by disability type`
          }
          subtitle={isLoading ? "Loading…" : `${profs.length} registered`}
          data={disabilityByLocality.data}
          series={disabilityByLocality.series}
          empty="No registered PWDs yet. Approve applications to populate this chart."
        />
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

      {showPending ? (
        <PendingApplicantsModal
          applications={pendingApps}
          onClose={() => setShowPending(false)}
        />
      ) : null}
    </div>
  );
}
