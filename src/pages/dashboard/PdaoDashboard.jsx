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
      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Registered PWDs" value="2,418" hint="Updated today" />
        <StatCard label="Active Subsidies" value="1,042" hint="87% active" />
        <StatCard label="Barangay Reports" value="24" hint="Ready for review" />
        <StatCard label="Pending Applications" value="58" hint="Needs verification" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <BarChartCard title="Subsidy Distributions" data={subsidyData} />
        <div className="gov-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
            Recent Activity
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            <li>Barangay San Roque report submitted.</li>
            <li>New PWD registration approved by Admin.</li>
            <li>SMS notification queued for 12 applicants.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
