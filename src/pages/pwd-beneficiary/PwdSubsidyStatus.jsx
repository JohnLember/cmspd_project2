const statusItems = [
  { label: "Current status", value: "Approved" },
  { label: "Next release", value: "June 15, 2026" },
  { label: "Program", value: "Monthly Assistance" },
];

export default function PwdSubsidyStatus() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Subsidy Status</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Track your assistance status and payout schedule.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
