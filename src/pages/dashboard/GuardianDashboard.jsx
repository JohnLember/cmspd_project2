export default function GuardianDashboard() {
  return (
    <div className="space-y-6">
      <div className="gov-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Guardian Overview</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Linked PWD profiles and monitoring updates will appear here.
        </p>
      </div>
      <div className="gov-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          You have no new notifications.
        </p>
      </div>
    </div>
  );
}
