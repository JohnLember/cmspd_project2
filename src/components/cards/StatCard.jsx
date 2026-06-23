const toneStyles = {
  primary: "bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]",
  success: "bg-[color:var(--gov-success-soft)] text-[color:var(--gov-success-fg)]",
  warning: "bg-[color:var(--gov-warning-soft)] text-[color:var(--gov-warning-fg)]",
  danger: "bg-[color:var(--gov-danger-soft)] text-[color:var(--gov-danger-fg)]",
};

export default function StatCard({ label, value, hint, icon: Icon, tone = "primary" }) {
  return (
    <div className="gov-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[color:var(--gov-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.01em] text-[color:var(--gov-text)]">
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] ${
              toneStyles[tone] ?? toneStyles.primary
            }`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-3 text-sm text-[color:var(--gov-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
