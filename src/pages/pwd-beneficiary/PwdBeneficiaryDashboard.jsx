export default function PwdBeneficiaryDashboard() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
          PWD Dashboard
        </p>
        <h2 className="text-xl font-semibold">Welcome to your PWD portal</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          View your digital ID, subsidy status, and the latest announcements.
        </p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="gov-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
            Digital ID
          </p>
          <p className="mt-2 text-lg font-semibold">Active</p>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Your PWD ID is valid until Dec 2026.
          </p>
        </div>
        <div className="gov-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
            Subsidy Status
          </p>
          <p className="mt-2 text-lg font-semibold">Approved</p>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Next payout scheduled on June 15.
          </p>
        </div>
        <div className="gov-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
            Announcements
          </p>
          <p className="mt-2 text-lg font-semibold">2 new updates</p>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Read the latest barangay advisories.
          </p>
        </div>
      </section>
    </div>
  );
}
