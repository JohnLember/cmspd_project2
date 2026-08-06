import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Stacked bar chart: each bar is a category (e.g. barangay), split into
// coloured segments per series (e.g. disability type). Segment height shows how
// many of each type, and the full bar height is the category total.
// `series` is an array of { key, label, color }.
// Pass `grouped` to put each series in its own side-by-side bar instead.
export default function StackedBarChartCard({
  title,
  data,
  series,
  subtitle,
  grouped = false,
  empty = "No data yet.",
}) {
  const hasData = Array.isArray(data) && data.length > 0 && series.length > 0;

  return (
    <div className="gov-card rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
          {title}
        </h3>
        {subtitle ? (
          <span className="shrink-0 text-xs text-[color:var(--gov-muted)]">
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="mt-4 h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} maxBarSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="name"
                stroke="var(--gov-muted)"
                fontSize={12}
                interval={0}
                angle={data.length > 5 ? -25 : 0}
                textAnchor={data.length > 5 ? "end" : "middle"}
                height={data.length > 5 ? 60 : 30}
              />
              <YAxis stroke="var(--gov-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "var(--chart-cursor)" }}
                contentStyle={{
                  background: "var(--gov-surface)",
                  border: "1px solid var(--gov-border)",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "var(--gov-text)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "var(--gov-muted)" }}
              />
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stackId={grouped ? undefined : "stack"}
                  fill={s.color}
                  // Stacked: 2px card-coloured gap so adjacent segments stay
                  // readable even when two fills are close in hue. Grouped bars
                  // are already separated, so no stroke.
                  stroke={grouped ? undefined : "var(--gov-card)"}
                  strokeWidth={grouped ? 0 : 2}
                  radius={
                    grouped || i === series.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--gov-muted)]">
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}
