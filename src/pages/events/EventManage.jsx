import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Package,
  Plus,
  ScanLine,
  Trash2,
  Undo2,
  Users,
} from "lucide-react";
import {
  deleteAnnouncement,
  getAnnouncement,
  updateAnnouncement,
} from "../../services/supabase/announcements.js";
import {
  addRecipients,
  getRecipients,
  removeRecipient,
  setReceived,
  updateRecipientQuantity,
} from "../../services/supabase/recipients.js";
import { disabilityLabel } from "../../constants/disability.js";
import { fmtEventWhen } from "../../utils/eventFormat.js";
import { exportRecipientReceipt } from "../../utils/receiptPdf.js";
import StatCard from "../../components/cards/StatCard.jsx";
import AddRecipientsModal from "../../components/events/AddRecipientsModal.jsx";
import CheckInModal from "../../components/events/CheckInModal.jsx";
import { useRealtime } from "../../hooks/useRealtime.js";

const displayId = (p) =>
  p?.pwd_id_number || (p?.id ? `PWD-${p.id.slice(0, 8).toUpperCase()}` : "—");

const fmtReceived = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export default function EventManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    itemType: "",
    eventDate: "",
    startTime: "",
    endTime: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    const [{ announcement: a, error: aErr }, { recipients: r }] =
      await Promise.all([getAnnouncement(id), getRecipients(id)]);
    if (aErr) setError(aErr.message || "Unable to load this event.");
    else setAnnouncement(a);
    setRecipients(r);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  useRealtime("announcement_recipients", load, `announcement_id=eq.${id}`);
  useRealtime("announcements", load, `id=eq.${id}`);

  const item = announcement?.item_type || announcement?.title || "Assistance";

  const sorted = useMemo(
    () =>
      [...recipients].sort((a, b) =>
        (a.profile?.full_name || "").localeCompare(b.profile?.full_name || "")
      ),
    [recipients]
  );

  const stats = useMemo(() => {
    const total = recipients.length;
    const rec = recipients.filter((r) => r.status === "received");
    return {
      total,
      received: rec.length,
      given: rec.reduce((s, r) => s + (r.quantity || 0), 0),
    };
  }, [recipients]);

  const startEdit = () => {
    setForm({
      title: announcement.title || "",
      body: announcement.body || "",
      itemType: announcement.item_type || "",
      eventDate: announcement.event_date || "",
      startTime: announcement.start_time ? announcement.start_time.slice(0, 5) : "",
      endTime: announcement.end_time ? announcement.end_time.slice(0, 5) : "",
    });
    setEditing(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    setSavingEdit(true);
    const { error: editError } = await updateAnnouncement(id, {
      title: form.title.trim(),
      body: form.body.trim(),
      itemType: form.itemType.trim(),
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: form.endTime,
    });
    if (editError) toast.error(editError.message || "Unable to save changes.");
    else {
      setEditing(false);
      toast.success("Event updated.");
      await load();
    }
    setSavingEdit(false);
  };

  const handleAdd = async (pwdIds) => {
    const { error: addError } = await addRecipients(id, pwdIds);
    if (addError) toast.error(addError.message || "Unable to add recipients.");
    else {
      setShowAdd(false);
      toast.success(
        `${pwdIds.length} recipient${pwdIds.length === 1 ? "" : "s"} added.`
      );
      await load();
    }
  };

  const markReceived = async (r) => {
    const { recipient, error: e } = await setReceived(r.id, r.status !== "received");
    if (e) {
      toast.error(e.message || "Unable to update.");
      return;
    }
    // Auto-generate the receipt when marking received.
    if (recipient?.status === "received") {
      await exportRecipientReceipt(recipient, { item });
    }
    await load();
  };

  const saveQuantity = async (r, raw) => {
    const qty = Math.max(1, parseInt(raw, 10) || 1);
    if (qty === r.quantity) return;
    const { error: e } = await updateRecipientQuantity(r.id, qty);
    if (e) toast.error(e.message || "Unable to update quantity.");
    else await load();
  };

  const reprint = (r) => exportRecipientReceipt(r, { item });

  const confirmRemove = (r) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Remove recipient?</p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            {r.profile?.full_name || "This PWD"} will be removed from this event.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={closeToast} className="btn btn-secondary h-9 px-3 text-xs">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                closeToast();
                const { error: e } = await removeRecipient(r.id);
                if (e) toast.error(e.message || "Unable to remove.");
                else await load();
              }}
              className="btn btn-danger h-9 px-3 text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      ),
      { toastId: `remove-recip-${r.id}`, closeButton: false, autoClose: false, closeOnClick: false, className: "gov-card" }
    );
  };

  const confirmDelete = () => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Delete this event?</p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            “{announcement.title}” and all its recipient records will be deleted.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={closeToast} className="btn btn-secondary h-9 px-3 text-xs">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                closeToast();
                const { error: e } = await deleteAnnouncement(id);
                if (e) toast.error(e.message || "Unable to delete.");
                else {
                  toast.success("Event deleted.");
                  navigate("/app/events");
                }
              }}
              className="btn btn-danger h-9 px-3 text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { toastId: `delete-event-${id}`, closeButton: false, autoClose: false, closeOnClick: false, className: "gov-card" }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="gov-skeleton h-8 w-40" />
        <div className="gov-skeleton h-40 w-full" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="space-y-4">
        <Link to="/app/events" className="btn btn-ghost h-9 px-3 text-xs">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to events
        </Link>
        <div role="alert" className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]">
          {error || "Event not found."}
        </div>
      </div>
    );
  }

  const when = fmtEventWhen(
    announcement.event_date,
    announcement.start_time,
    announcement.end_time
  );

  return (
    <div className="space-y-6">
      <Link
        to="/app/events"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--gov-primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to events
      </Link>

      <section className="gov-card p-6">
        {editing ? (
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveEdit}>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="gov-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">Message</label>
              <textarea rows={3} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} className="gov-input" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Item / assistance</label>
              <input type="text" value={form.itemType} onChange={(e) => setForm((p) => ({ ...p, itemType: e.target.value }))} className="gov-input" placeholder="e.g. Wheelchair" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">When</label>
              <input type="date" value={form.eventDate} onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} className="gov-input" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Start time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} className="gov-input" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">End time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} className="gov-input" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={savingEdit} className="btn btn-primary">
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-[-0.01em]">
                  {announcement.title}
                </h2>
                {announcement.item_type ? (
                  <span className="gov-badge gov-badge--info">
                    <Package className="h-3 w-3" aria-hidden="true" />
                    {announcement.item_type}
                  </span>
                ) : null}
              </div>
              {when ? (
                <p className="mt-1 text-sm text-[color:var(--gov-muted)]">{when}</p>
              ) : null}
              <p className="mt-3 whitespace-pre-line text-sm text-[color:var(--gov-text)]">
                {announcement.body}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={startEdit} className="btn btn-secondary h-9 px-3 text-xs">
                Edit
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-ghost h-9 px-3 text-xs text-[color:var(--gov-danger-fg)] hover:bg-[color:var(--gov-danger-soft)] hover:text-[color:var(--gov-danger-fg)]"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Recipients" value={stats.total} icon={Users} tone="primary" />
        <StatCard label="Received" value={stats.received} icon={CheckCircle2} tone="success" />
        <StatCard label="Items given" value={stats.given} icon={Package} tone="warning" />
      </section>

      <section className="gov-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-[color:var(--gov-text)]">Recipients</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowCheckIn(true)} className="btn btn-primary h-9 px-3 text-xs">
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Check-in
            </button>
            <button type="button" onClick={() => setShowAdd(true)} className="btn btn-secondary h-9 px-3 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add recipients
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                <th className="pb-3 pr-4 font-semibold">PWD</th>
                <th className="pb-3 pr-4 font-semibold">Barangay</th>
                <th className="pb-3 pr-4 font-semibold">Disability</th>
                <th className="pb-3 pr-4 font-semibold">Qty</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Received</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[color:var(--gov-muted)]">
                    No recipients yet. Use “Check-in” at the event, or “Add recipients” to prepare the list.
                  </td>
                </tr>
              ) : (
                sorted.map((r) => {
                  const received = r.status === "received";
                  return (
                    <tr key={r.id} className="border-b border-[color:var(--gov-border)] last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{r.profile?.full_name || "—"}</p>
                        <p className="text-xs text-[color:var(--gov-muted)]">
                          {displayId(r.profile)}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                        {r.profile?.barangay || "—"}
                      </td>
                      <td className="py-3 pr-4 text-[color:var(--gov-muted)]">
                        {r.profile?.data?.disabilityTypes
                          ? disabilityLabel(r.profile.data.disabilityTypes)
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          key={`qty-${r.id}-${r.quantity}`}
                          type="number"
                          min={1}
                          defaultValue={r.quantity}
                          onBlur={(e) => saveQuantity(r, e.target.value)}
                          className="gov-input h-9 w-16 px-2 py-1 text-sm"
                          aria-label="Quantity"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        {received ? (
                          <span className="gov-badge gov-badge--success">Received</span>
                        ) : (
                          <span className="gov-badge gov-badge--warning">Pending</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-[color:var(--gov-muted)]">
                        {received ? fmtReceived(r.received_at) : "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {received ? (
                            <button type="button" onClick={() => reprint(r)} className="btn btn-ghost h-9 px-2 text-xs" aria-label="Download receipt">
                              <Download className="h-4 w-4" aria-hidden="true" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => markReceived(r)}
                            className={`btn h-9 px-3 text-xs ${received ? "btn-secondary" : "btn-primary"}`}
                          >
                            {received ? (
                              <>
                                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> Undo
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Mark received
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmRemove(r)}
                            className="btn btn-ghost h-9 w-9 px-0 text-[color:var(--gov-danger-fg)] hover:bg-[color:var(--gov-danger-soft)]"
                            aria-label="Remove recipient"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showAdd ? (
        <AddRecipientsModal
          excludeIds={recipients.map((r) => r.pwd_id)}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      ) : null}

      {showCheckIn ? (
        <CheckInModal
          announcementId={id}
          item={item}
          onChange={load}
          onClose={() => setShowCheckIn(false)}
        />
      ) : null}
    </div>
  );
}
