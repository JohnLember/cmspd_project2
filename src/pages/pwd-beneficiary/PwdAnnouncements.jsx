import AnnouncementsFeed from "../../components/ui/AnnouncementsFeed.jsx";

export default function PwdAnnouncements() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">Announcements</h2>
        <p className="mt-1 text-[color:var(--gov-muted)]">
          Official advisories and updates from PDAO.
        </p>
      </header>
      <AnnouncementsFeed emptyText="No announcements from PDAO yet." />
    </div>
  );
}
