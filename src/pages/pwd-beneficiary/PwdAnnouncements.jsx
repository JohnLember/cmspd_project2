const announcements = [
  {
    title: "Barangay support schedule",
    message: "Mobile assistance visits will be held every Friday morning.",
    date: "May 28, 2026",
  },
  {
    title: "PWD ID renewal",
    message: "Renewal submissions start June 5. Prepare your documents early.",
    date: "May 25, 2026",
  },
];

export default function PwdAnnouncements() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Official advisories and updates for PWD beneficiaries.
        </p>
        <div className="mt-6 space-y-3">
          {announcements.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.title}</p>
                <span className="text-xs text-[color:var(--gov-muted)]">
                  {item.date}
                </span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
