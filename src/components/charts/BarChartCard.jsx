import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function BarChartCard({ title, data, subtitle = "Last 6 months" }) {
  return (
    <div className="gov-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
          {title}
        </h3>
        <span className="text-xs text-[color:var(--gov-muted)]">{subtitle}</span>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gov-border)" />
            <XAxis dataKey="name" stroke="var(--gov-muted)" fontSize={12} />
            <YAxis
              stroke="var(--gov-muted)"
              fontSize={12}
              allowDecimals={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
              contentStyle={{
                background: "var(--gov-surface)",
                border: "1px solid var(--gov-border)",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "var(--gov-text)" }}
            />
            <Bar dataKey="value" fill="var(--gov-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
