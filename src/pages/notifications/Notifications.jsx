import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
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
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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
    const { announcement, emailedCount, recipientCount, emailError, error: postError } =
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
      });
    if (postError) {
      setError(postError.message || "Unable to post announcement.");
    } else {
      setAnnouncements((prev) => [announcement, ...prev]);
      setTitle("");
      setBody("");
      if (emailError) {
        toast.success("Announcement posted to PWDs and guardians.");
        toast.warn(emailError);
      } else if (recipientCount > 0) {
        toast.success(
          `Announcement posted and emailed to ${emailedCount} of ${recipientCount} verified ${
            recipientCount === 1 ? "beneficiary" : "beneficiaries"
          }.`
        );
      } else {
        toast.success(
          "Announcement posted. No beneficiaries have a verified email yet, so no emails were sent."
        );
      }
    }
    setPosting(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditBody(item.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim() || !editBody.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    setSavingEdit(true);
    const { announcement, error: editError } = await updateAnnouncement(id, {
      title: editTitle.trim(),
      body: editBody.trim(),
    });
    if (editError) {
      toast.error(editError.message || "Unable to save changes.");
    } else {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? announcement : a))
      );
      cancelEdit();
      toast.success("Announcement updated.");
    }
    setSavingEdit(false);
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
              className="btn btn-secondary h-9 px-3 text-xs"
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
              className="btn btn-danger h-9 px-3 text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-announcement-${item.id}`,
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: "gov-card",
      }
    );
  };

  return (
    <div className="space-y-6">
      <section className="gov-card p-6">
        <h2 className="text-xl font-semibold">Post an announcement</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Published announcements appear in every PWD beneficiary and guardian
          portal, and are emailed to beneficiaries with a verified email address.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handlePost}>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="ann-title">
              Title<span className="text-[color:var(--gov-danger-fg)]"> *</span>
            </label>
            <input
              id="ann-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="gov-input"
              placeholder="e.g. PWD ID renewal schedule"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="ann-body">
              Message<span className="text-[color:var(--gov-danger-fg)]"> *</span>
            </label>
            <textarea
              id="ann-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="gov-input"
              placeholder="Write the advisory details here…"
            />
          </div>
          {error ? (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
            >
              {error}
            </div>
          ) : null}
          <button type="submit" disabled={posting} className="btn btn-primary">
            {posting ? "Posting…" : "Post announcement"}
          </button>
        </form>
      </section>

      <section className="gov-card p-5">
        <h3 className="font-semibold text-[color:var(--gov-text)]">
          Posted announcements
        </h3>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            [0, 1].map((i) => (
              <div key={i} className="gov-skeleton h-20 w-full" />
            ))
          ) : announcements.length === 0 ? (
            <p className="rounded-[var(--radius-md)] bg-[color:var(--gov-surface)] px-4 py-8 text-center text-sm text-[color:var(--gov-muted)]">
              No announcements posted yet.
            </p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4"
              >
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="gov-input font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="gov-input"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="btn btn-secondary h-9 px-3 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        disabled={savingEdit}
                        className="btn btn-primary h-9 px-3 text-xs"
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[color:var(--gov-text)]">
                          {item.title}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--gov-muted)]">
                          {item.body}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="btn btn-ghost h-9 px-3 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(item)}
                          className="btn btn-ghost h-9 px-3 text-xs text-[color:var(--gov-danger-fg)] hover:bg-[color:var(--gov-danger-soft)] hover:text-[color:var(--gov-danger-fg)]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[color:var(--gov-muted)]">
                      {fmt(item.created_at)}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
