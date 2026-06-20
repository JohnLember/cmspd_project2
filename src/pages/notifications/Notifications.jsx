import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
} from "../../services/supabase/announcements.js";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export default function Notifications() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { announcements: rows, error: loadError } = await getAnnouncements();
      if (!isMounted) return;
      if (loadError) setError(loadError.message || "Unable to load announcements.");
      else setAnnouncements(rows);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required.");
      return;
    }
    setPosting(true);
    const { announcement, error: postError } = await createAnnouncement({
      title: title.trim(),
      body: body.trim(),
    });
    if (postError) {
      setError(postError.message || "Unable to post announcement.");
    } else {
      setAnnouncements((prev) => [announcement, ...prev]);
      setTitle("");
      setBody("");
      toast.success("Announcement posted to PWDs and guardians.");
    }
    setPosting(false);
  };

  const confirmDelete = (item) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Delete announcement?</p>
          <p className="text-xs text-[color:var(--gov-muted)]">“{item.title}”</p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                closeToast();
                const { error: delError } = await deleteAnnouncement(item.id);
                if (delError) {
                  setError(delError.message || "Unable to delete.");
                } else {
                  setAnnouncements((prev) =>
                    prev.filter((a) => a.id !== item.id)
                  );
                }
              }}
              className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { closeButton: false, autoClose: false, closeOnClick: false, className: "gov-card rounded-2xl border border-[color:var(--gov-border)]" }
    );
  };

  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
          Announcements
        </p>
        <h2 className="text-xl font-semibold">Post an announcement</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Published announcements appear in every PWD beneficiary and guardian
          portal.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handlePost}>
          <div>
            <label className="text-sm font-medium" htmlFor="ann-title">
              Title<span className="text-red-600"> *</span>
            </label>
            <input
              id="ann-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
              placeholder="e.g. PWD ID renewal schedule"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="ann-body">
              Message<span className="text-red-600"> *</span>
            </label>
            <textarea
              id="ann-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
              placeholder="Write the advisory details here…"
            />
          </div>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={posting}
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {posting ? "Posting…" : "Post announcement"}
          </button>
        </form>
      </section>

      <section className="gov-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
          Posted announcements
        </h3>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-[color:var(--gov-muted)]">Loading…</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-[color:var(--gov-muted)]">
              No announcements posted yet.
            </p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--gov-text)]">
                      {item.title}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-xs text-[color:var(--gov-muted)]">
                      {item.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmDelete(item)}
                    className="shrink-0 text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-3 text-xs text-[color:var(--gov-muted)]">
                  {fmt(item.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
