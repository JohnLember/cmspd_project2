import AnnouncementsFeed from "../../components/ui/AnnouncementsFeed.jsx";

export default function PwdAnnouncements() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Official advisories and updates from PDAO.
        </p>
        <div className="mt-6">
          <AnnouncementsFeed emptyText="No announcements from PDAO yet." />
        </div>
      </section>
    </div>
  );
}
