import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ScanLine,
  Search,
  UserPlus,
} from "lucide-react";
import {
  checkInByPwdId,
  findCheckInTarget,
} from "../../services/supabase/recipients.js";
import { exportRecipientReceipt } from "../../utils/receiptPdf.js";

// Auto-format typed digits into the PWD ID pattern RR-PP-MM-BB-NNNNNN
// (groups of 2-2-2-2-6) so staff never has to type the dashes.
const formatPwdId = (raw) => {
  const d = (raw || "").replace(/\D/g, "").slice(0, 14);
  const parts = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 4));
  if (d.length > 4) parts.push(d.slice(4, 6));
  if (d.length > 6) parts.push(d.slice(6, 8));
  if (d.length > 8) parts.push(d.slice(8, 14));
  return parts.join("-");
};

const digitsOf = (v) => (v || "").replace(/\D/g, "");

// Staff-operated check-in. Stays open across successive beneficiaries: after
// each check-in the input clears + refocuses. Closes only via the Done button
// (backdrop click / Escape are intentionally disabled to avoid losing the
// session mid-line). When a full ID is entered it looks the person up and
// pre-fills the planned quantity so confirming never silently overwrites it.
export default function CheckInModal({ announcementId, item, onClose, onChange }) {
  const [pwdId, setPwdId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lookup, setLookup] = useState(null); // { status, name, plannedQty, receivedAt, message }
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // post-confirm success panel
  const inputRef = useRef(null);
  const lookupSeq = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Look the beneficiary up once a complete ID is typed, and pre-fill quantity.
  useEffect(() => {
    const seq = ++lookupSeq.current;
    (async () => {
      if (digitsOf(pwdId).length < 14) {
        if (seq === lookupSeq.current) setLookup(null);
        return;
      }
      setLookup({ status: "searching" });
      const res = await findCheckInTarget(announcementId, pwdId);
      if (seq !== lookupSeq.current) return; // a newer keystroke superseded this
      if (res.status === "on_list") {
        const planned = res.recipient?.quantity || 1;
        setQuantity(planned);
        setLookup({ status: "on_list", name: res.profile?.full_name, plannedQty: planned });
      } else if (res.status === "walk_in") {
        setQuantity(1);
        setLookup({ status: "walk_in", name: res.profile?.full_name });
      } else if (res.status === "already") {
        setLookup({
          status: "already",
          name: res.profile?.full_name,
          receivedAt: res.recipient?.received_at,
        });
      } else if (res.status === "not_found") {
        setLookup({ status: "not_found" });
      } else {
        setLookup({ status: "error", message: res.error?.message });
      }
    })();
  }, [pwdId, announcementId]);

  const canConfirm =
    !busy && (lookup?.status === "on_list" || lookup?.status === "walk_in");

  const downloadReceipt = (recipient) =>
    exportRecipientReceipt(recipient, { item });

  const handleIdChange = (e) => {
    setResult(null);
    setPwdId(formatPwdId(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canConfirm) return;
    setBusy(true);
    const res = await checkInByPwdId(announcementId, pwdId, { quantity });
    if (res.status === "error") {
      setLookup({ status: "error", message: res.error?.message });
    } else if (res.status === "already") {
      setLookup({
        status: "already",
        name: res.profile?.full_name,
        receivedAt: res.recipient?.received_at,
      });
    } else if (res.status === "not_found") {
      setLookup({ status: "not_found" });
    } else {
      // checked_in or walk_in — receipt auto-downloads.
      await downloadReceipt(res.recipient);
      setResult({
        kind: res.status === "walk_in" ? "walk_in" : "checked_in",
        name: res.profile?.full_name,
        recipient: res.recipient,
      });
      onChange?.();
      setPwdId(""); // clears lookup via effect; ready for the next person
      setQuantity(1);
    }
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
              inputMode="numeric"
              value={pwdId}
              onChange={handleIdChange}
              className="gov-input text-lg tracking-wide"
              placeholder="16-03-05-05-000012"
              autoComplete="off"
            />
          </div>

          {/* Live lookup preview before confirming */}
          {lookup && lookup.status !== "searching" ? (
            <LookupPreview lookup={lookup} pwdId={pwdId} />
          ) : lookup?.status === "searching" ? (
            <p className="flex items-center gap-2 text-xs text-[color:var(--gov-muted)]">
              <Search className="h-3.5 w-3.5" aria-hidden="true" /> Looking up…
            </p>
          ) : null}

          <div className="flex items-end gap-3">
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium" htmlFor="checkin-qty">
                Qty
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
                title="Pre-filled from the planned quantity. Adjust only if the actual amount differs. Leave at 1 for cash/food."
              />
            </div>
            <button
              type="submit"
              disabled={!canConfirm}
              className="btn btn-primary flex-1"
            >
              {busy ? "Checking…" : "Confirm & receipt"}
            </button>
          </div>
          {lookup?.status === "on_list" ? (
            <p className="text-xs text-[color:var(--gov-muted)]">
              Qty pre-filled from the planned amount ({lookup.plannedQty}). Change
              it only if the actual amount given differs.
            </p>
          ) : null}
        </form>

        {result ? (
          <div className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--gov-success-soft)] p-4 text-sm text-[color:var(--gov-success-fg)]">
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
        ) : null}

        <p className="mt-4 text-xs text-[color:var(--gov-muted)]">
          The window stays open for the next beneficiary. Click “Done” when the
          line is finished.
        </p>
      </div>
    </div>
  );
}

function LookupPreview({ lookup, pwdId }) {
  if (lookup.status === "on_list") {
    return (
      <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-info-soft)] p-3 text-sm text-[color:var(--gov-info-fg)]">
        <p className="font-semibold">{lookup.name}</p>
        <p className="mt-0.5 text-xs">On the list · planned qty {lookup.plannedQty}. Ready to confirm.</p>
      </div>
    );
  }
  if (lookup.status === "walk_in") {
    return (
      <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-info-soft)] p-3 text-sm text-[color:var(--gov-info-fg)]">
        <p className="flex items-center gap-2 font-semibold">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {lookup.name}
        </p>
        <p className="mt-0.5 text-xs">Not on the list — will be added as a walk-in.</p>
      </div>
    );
  }
  if (lookup.status === "already") {
    return (
      <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-warning-soft)] p-3 text-sm text-[color:var(--gov-warning-fg)]">
        <p className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Already received
        </p>
        <p className="mt-0.5 text-xs">
          {lookup.name} was already marked received
          {lookup.receivedAt
            ? ` on ${new Date(lookup.receivedAt).toLocaleDateString("en-PH")}`
            : ""}
          . No duplicate will be created.
        </p>
      </div>
    );
  }
  if (lookup.status === "not_found") {
    return (
      <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] p-3 text-sm text-[color:var(--gov-danger-fg)]">
        <p className="font-semibold">No PWD found</p>
        <p className="mt-0.5 text-xs">
          No registered PWD has the ID “{pwdId}”. Check the number and try again.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] p-3 text-sm text-[color:var(--gov-danger-fg)]">
      {lookup.message || "Something went wrong. Try again."}
    </div>
  );
}
