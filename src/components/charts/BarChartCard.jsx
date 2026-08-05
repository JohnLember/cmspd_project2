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
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="name"
              stroke="var(--gov-muted)"
              fontSize={12}
              interval={0}
              angle={data?.length > 5 ? -25 : 0}
              textAnchor={data?.length > 5 ? "end" : "middle"}
              height={data?.length > 5 ? 60 : 30}
            />
            <YAxis
              stroke="var(--gov-muted)"
              fontSize={12}
              allowDecimals={false}
            />

            <Tooltip
              cursor={{ fill: "var(--chart-cursor)" }}
              contentStyle={{
                background: "var(--gov-surface)",
                border: "1px solid var(--gov-border)",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "var(--gov-text)" }}
            />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
