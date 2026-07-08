import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ScanLine,
  UserPlus,
} from "lucide-react";
import { checkInByPwdId } from "../../services/supabase/recipients.js";
import { exportRecipientReceipt } from "../../utils/receiptPdf.js";

// Staff-operated check-in. Stays open across successive beneficiaries: after
// each check-in the input clears + refocuses. Closes only via the Done button
// (backdrop click / Escape are intentionally disabled to avoid losing the
// session mid-line).
export default function CheckInModal({ announcementId, item, onClose, onChange }) {
  const [pwdId, setPwdId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { kind, name, ... }
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const downloadReceipt = (recipient) =>
    exportRecipientReceipt(recipient, { item });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = pwdId.trim();
    if (!id || busy) return;
    setBusy(true);
    setResult(null);
    const res = await checkInByPwdId(announcementId, id, { quantity });
    if (res.status === "not_found") {
      setResult({ kind: "not_found", id });
    } else if (res.status === "error") {
      setResult({ kind: "error", message: res.error?.message });
    } else if (res.status === "already") {
      setResult({
        kind: "already",
        name: res.profile?.full_name,
        receivedAt: res.recipient?.received_at,
      });
    } else {
      // checked_in or walk_in — receipt auto-downloads.
      await downloadReceipt(res.recipient);
      setResult({
        kind: res.status === "walk_in" ? "walk_in" : "checked_in",
        name: res.profile?.full_name,
        recipient: res.recipient,
      });
      onChange?.();
    }
    setPwdId("");
    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div className="gov-backdrop absolute inset-0" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Check-in beneficiaries"
        className="gov-overlay relative w-full max-w-md p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ScanLine className="h-5 w-5 text-[color:var(--gov-primary)]" aria-hidden="true" />
              Check-in
            </h3>
            <p className="text-sm text-[color:var(--gov-muted)]">
              {item ? `Distributing: ${item}` : "Mark beneficiaries as received."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary h-9 px-3 text-xs"
          >
            Done
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="checkin-id">
              PWD ID number
            </label>
            <input
              id="checkin-id"
              ref={inputRef}
              type="text"
              value={pwdId}
              onChange={(e) => setPwdId(e.target.value)}
              className="gov-input text-lg tracking-wide"
              placeholder="Enter or scan the PWD ID"
              autoComplete="off"
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium" htmlFor="checkin-qty">
                Quantity
              </label>
              <input
                id="checkin-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="gov-input"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !pwdId.trim()}
              className="btn btn-primary flex-1"
            >
              {busy ? "Checking…" : "Confirm & receipt"}
            </button>
          </div>
        </form>

        {result ? (
          <div className="mt-4">
            {result.kind === "checked_in" || result.kind === "walk_in" ? (
              <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-success-soft)] p-4 text-sm text-[color:var(--gov-success-fg)]">
                <p className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {result.name} — received
                  {result.kind === "walk_in" ? " (added as walk-in)" : ""}
                </p>
                <p className="mt-1 text-xs">
                  Receipt {result.recipient?.receipt_number} downloaded.
                </p>
                <button
                  type="button"
                  onClick={() => downloadReceipt(result.recipient)}
                  className="btn btn-secondary mt-3 h-8 px-3 text-xs"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download receipt again
                </button>
              </div>
            ) : result.kind === "already" ? (
              <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-warning-soft)] p-4 text-sm text-[color:var(--gov-warning-fg)]">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Already received
                </p>
                <p className="mt-1 text-xs">
                  {result.name} was already marked received
                  {result.receivedAt
                    ? ` on ${new Date(result.receivedAt).toLocaleDateString("en-PH")}`
                    : ""}
                  . No duplicate created.
                </p>
              </div>
            ) : result.kind === "not_found" ? (
              <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] p-4 text-sm text-[color:var(--gov-danger-fg)]">
                <p className="flex items-center gap-2 font-semibold">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  No PWD found
                </p>
                <p className="mt-1 text-xs">
                  No registered PWD has the ID “{result.id}”. Check the number and
                  try again.
                </p>
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] p-4 text-sm text-[color:var(--gov-danger-fg)]">
                {result.message || "Something went wrong. Try again."}
              </div>
            )}
          </div>
        ) : null}

        <p className="mt-4 text-xs text-[color:var(--gov-muted)]">
          The window stays open for the next beneficiary. Click “Done” when the
          line is finished.
        </p>
      </div>
    </div>
  );
}
