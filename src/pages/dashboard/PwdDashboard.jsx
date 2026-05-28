export default function PwdDashboard() {
  return (
    <div className="space-y-6">
      <div className="gov-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold">PWD Digital ID</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Your verified ID and subsidy status will appear here once Supabase is
          connected.
        </p>
      </div>
      <div className="gov-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold">Announcements</h3>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          No new announcements today.
        </p>
      </div>
    </div>
  );
}
