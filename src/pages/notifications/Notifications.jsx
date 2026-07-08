import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Package, Settings2 } from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../../services/supabase/announcements.js";
import { useRealtime } from "../../hooks/useRealtime.js";
import { fmtEventDate, fmtTimeRange } from "../../utils/eventFormat.js";

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

const PAGE_SIZE = 10;

// Windowed page numbers: first, last, current ±1, with "…" gaps for big sets.
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  if (current > 3) pages.push("start-ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("end-ellipsis");
  pages.push(total);
  return pages;
}

export default function Notifications() {
  const [announcements, setAnnouncements] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [itemType, setItemType] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    const { announcements: rows, error: loadError } = await getAnnouncements();
    if (loadError) setError(loadError.message || "Unable to load announcements.");
    else setAnnouncements(rows);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Keep the list in sync across PDAO sessions in realtime.
  useRealtime("announcements", load);

  const totalPages = Math.max(1, Math.ceil(announcements.length / PAGE_SIZE));
  // Derive a valid page so the list shrinking (e.g. after a delete) never
  // strands us on an empty page — no effect/setState needed.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = announcements.slice(start, start + PAGE_SIZE);

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required.");
      return;
    }
    setPosting(true);
    const {
      announcement,
      emailedCount,
      recipientCount,
      emailError,
      smsCount,
      smsRecipientCount,
      smsError,
      error: postError,
    } = await createAnnouncement({
      title: title.trim(),
      body: body.trim(),
      eventDate,
      startTime,
      endTime,
      itemType,
    });
    if (postError) {
      setError(postError.message || "Unable to post announcement.");
    } else {
      // Guard against a duplicate: the realtime INSERT event may have already
      // added this row while the edge function was still finishing its work.
      setAnnouncements((prev) =>
        prev.some((a) => a.id === announcement.id)
          ? prev
          : [announcement, ...prev]
      );
      setPage(1);
      setTitle("");
      setBody("");
      setEventDate("");
      setStartTime("");
      setEndTime("");
      setItemType("");
      toast.success("Announcement posted to PWDs and guardians.");

      // Email delivery summary.
      if (emailError) {
        toast.warn(emailError);
      } else if (recipientCount > 0) {
        toast.info(
          `Emailed to ${emailedCount} of ${recipientCount} verified ${
            recipientCount === 1 ? "email recipient" : "email recipients"
          }.`
        );
      }

      // SMS delivery summary.
      if (smsError) {
        toast.warn(smsError);
      } else if (smsRecipientCount > 0) {
        toast.info(
          `SMS sent to ${smsCount} of ${smsRecipientCount} verified mobile ${
            smsRecipientCount === 1 ? "number" : "numbers"
          }.`
        );
      }
    }
    setPosting(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditEventDate(item.event_date || "");
    // Time columns come back as "HH:MM:SS"; the time input needs "HH:MM".
    setEditStartTime(item.start_time ? item.start_time.slice(0, 5) : "");
    setEditEndTime(item.end_time ? item.end_time.slice(0, 5) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditEventDate("");
    setEditStartTime("");
    setEditEndTime("");
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
      eventDate: editEventDate,
      startTime: editStartTime,
      endTime: editEndTime,
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="ann-when">
                When
              </label>
              <input
                id="ann-when"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="gov-input"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="ann-start">
                Start time
              </label>
              <input
                id="ann-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="gov-input"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="ann-end">
                End time
              </label>
              <input
                id="ann-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="gov-input"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-[color:var(--gov-muted)]">
            The date and time the event happens. Shown on the Events calendar and
            in the email. Optional.
          </p>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="ann-item">
              Item / assistance given
            </label>
            <input
              id="ann-item"
              type="text"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="gov-input w-full sm:max-w-xs"
              placeholder="e.g. Wheelchair"
            />
            <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
              Only for distribution events. Enables recipient check-in and
              receipts on the event page. Optional.
            </p>
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-[color:var(--gov-text)]">
            Posted announcements
          </h3>
          {!isLoading && announcements.length > 0 ? (
            <span className="tnum text-xs text-[color:var(--gov-muted)]">
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, announcements.length)} of{" "}
              {announcements.length}
            </span>
          ) : null}
        </div>
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
            pageItems.map((item) => (
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[color:var(--gov-muted)]">
                          When
                        </label>
                        <input
                          type="date"
                          value={editEventDate}
                          onChange={(e) => setEditEventDate(e.target.value)}
                          className="gov-input"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[color:var(--gov-muted)]">
                          Start time
                        </label>
                        <input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          className="gov-input"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[color:var(--gov-muted)]">
                          End time
                        </label>
                        <input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="gov-input"
                        />
                      </div>
                    </div>
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
                        <Link
                          to={`/app/events/${item.id}`}
                          className="btn btn-ghost h-9 px-3 text-xs"
                        >
                          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Manage
                        </Link>
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
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[color:var(--gov-muted)]">
                      {item.item_type ? (
                        <span className="gov-badge gov-badge--info">
                          <Package className="h-3 w-3" aria-hidden="true" />
                          {item.item_type}
                        </span>
                      ) : null}
                      {item.event_date ? (
                        <span className="gov-badge gov-badge--neutral">
                          When: {fmtEventDate(item.event_date)}
                          {fmtTimeRange(item.start_time, item.end_time)
                            ? `, ${fmtTimeRange(item.start_time, item.end_time)}`
                            : ""}
                        </span>
                      ) : null}
                      <span>Posted {fmt(item.created_at)}</span>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {!isLoading && totalPages > 1 ? (
          <nav
            className="mt-5 flex items-center justify-between gap-2 border-t border-[color:var(--gov-border)] pt-4"
            aria-label="Announcements pages"
          >
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((p) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`tnum grid h-9 min-w-9 place-items-center rounded-[var(--radius-md)] px-2 text-xs font-semibold transition-colors ${
                      p === currentPage
                        ? "bg-[color:var(--gov-primary)] text-[color:var(--gov-on-primary)]"
                        : "text-[color:var(--gov-muted)] hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={p}
                    className="px-1 text-xs text-[color:var(--gov-faint)]"
                    aria-hidden="true"
                  >
                    …
                  </span>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
