import BarChartCard from "../../components/charts/BarChartCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";

const subsidyData = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 180 },
  { name: "Mar", value: 150 },
  { name: "Apr", value: 210 },
  { name: "May", value: 195 },
  { name: "Jun", value: 230 },
];

export default function PdaoDashboard() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              PDAO Operations Overview
            </p>
            <h2 className="text-xl font-semibold">
              Good day, PDAO team. Here is your operational snapshot.
            </h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Monitor registrations, subsidies, and barangay updates in real
              time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            >
              Add PWD Profile
            </button>
            <button
              type="button"
              className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold text-[color:var(--gov-text)] transition hover:-translate-y-0.5"
            >
              Generate Report
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Registered PWDs" value="2,418" hint="Updated today" />
        <StatCard label="Active Subsidies" value="1,042" hint="87% active" />
        <StatCard label="Barangay Reports" value="24" hint="Ready for review" />
        <StatCard label="Pending Applications" value="58" hint="Needs verification" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <BarChartCard title="Subsidy Distributions" data={subsidyData} />
        <div className="gov-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
              Notifications Queue
            </h3>
            <span className="text-xs text-[color:var(--gov-muted)]">
              Last 24 hours
            </span>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            <li>12 SMS reminders queued for subsidy verification.</li>
            <li>3 guardian approvals pending confirmation.</li>
            <li>2 barangay summaries awaiting validation.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="gov-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
            Barangay Report Status
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
                <tr>
                  <th className="pb-3">Barangay</th>
                  <th className="pb-3">Submission</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-[color:var(--gov-text)]">
                {[
                  { name: "Brgy. San Roque", date: "May 28", status: "Reviewed" },
                  { name: "Brgy. San Isidro", date: "May 27", status: "Pending" },
                  { name: "Brgy. San Vicente", date: "May 26", status: "For update" },
                ].map((row) => (
                  <tr key={row.name} className="border-t border-[color:var(--gov-border)]">
                    <td className="py-3">{row.name}</td>
                    <td className="py-3">{row.date}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="gov-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
            Recent Activity
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            <li>Barangay San Roque report submitted.</li>
            <li>New PWD registration approved by Admin.</li>
            <li>SMS notification queued for 12 applicants.</li>
            <li>Disability classification summary updated.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
