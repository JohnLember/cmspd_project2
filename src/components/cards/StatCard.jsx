export default function StatCard({ label, value, hint }) {
  return (
    <div className="gov-card rounded-2xl px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
        {label}
      </p>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--gov-text)]">
        {value}
      </div>
      {hint ? (
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
