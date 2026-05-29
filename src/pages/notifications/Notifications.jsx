const notifications = [
  {
    id: "NTF-2301",
    title: "Barangay report submitted",
    message: "Brgy. San Roque submitted the May report.",
    time: "2 hours ago",
    type: "Barangay",
  },
  {
    id: "NTF-2302",
    title: "Application needs verification",
    message: "APP-2068 is missing a medical certificate.",
    time: "5 hours ago",
    type: "Application",
  },
  {
    id: "NTF-2303",
    title: "SMS reminders queued",
    message: "12 subsidy reminders are ready to send.",
    time: "Yesterday",
    type: "Notification",
  },
];

export default function Notifications() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Notifications Center
            </p>
            <h2 className="text-xl font-semibold">System Alerts and Updates</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Track announcements, reminders, and system alerts for PDAO staff.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold"
          >
            Mark all as read
          </button>
        </div>
      </section>

      <section className="gov-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <select className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm">
              <option>All types</option>
              <option>Barangay</option>
              <option>Application</option>
              <option>Notification</option>
            </select>
            <select className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm">
              <option>All status</option>
              <option>Unread</option>
              <option>Read</option>
            </select>
          </div>
          <button
            type="button"
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-xs font-semibold text-white"
          >
            Create announcement
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--gov-text)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
                    {item.message}
                  </p>
                </div>
                <div className="text-xs text-[color:var(--gov-muted)]">
                  {item.time}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--gov-muted)]">
                <span className="rounded-full border border-[color:var(--gov-border)] px-3 py-1">
                  {item.type}
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-[color:var(--gov-accent)]"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
