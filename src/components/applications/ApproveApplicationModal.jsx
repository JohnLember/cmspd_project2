import { useEffect, useRef, useState } from "react";

const officerFields = [
  ["lastName", "Last name"],
  ["firstName", "First name"],
  ["middleName", "Middle name"],
];

const emptyOfficer = { lastName: "", firstName: "", middleName: "" };

const inputClass =
  "mt-1 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-2 text-sm";

function OfficerInputs({ title, value, onChange }) {
  return (
    <fieldset className="rounded-2xl border border-[color:var(--gov-border)] p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {officerFields.map(([key, label]) => (
          <div key={key}>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              {label}
              {key !== "middleName" ? (
                <span className="text-red-600"> *</span>
              ) : null}
            </label>
            <input
              type="text"
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export default function ApproveApplicationModal({
  applicantName,
  onCancel,
  onConfirm,
  isSubmitting,
  error,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [processingOfficer, setProcessingOfficer] = useState(emptyOfficer);
  const [approvingOfficer, setApprovingOfficer] = useState(emptyOfficer);
  const [localError, setLocalError] = useState("");

  // Size the canvas backing store to its displayed size × devicePixelRatio so
  // the drawn line lines up exactly under the pen tip (XP-Pen and others) and
  // stays crisp on high-DPI screens.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  const posOf = (evt) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastRef.current = posOf(e);
    canvasRef.current.setPointerCapture?.(e.pointerId);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    // Pen tablets report many points between frames; draw them all for a
    // smooth, accurate stroke.
    const points = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    points.forEach((p) => {
      const pos = posOf(p);
      ctx.beginPath();
      ctx.moveTo(lastRef.current.x, lastRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastRef.current = pos;
    });
    if (!hasSignature) setHasSignature(true);
  };

  const endDraw = (e) => {
    drawingRef.current = false;
    lastRef.current = null;
    canvasRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasSignature(false);
  };

  const handleConfirm = () => {
    setLocalError("");
    if (!hasSignature) {
      setLocalError("The PWD must sign before approving.");
      return;
    }
    if (!processingOfficer.lastName.trim() || !processingOfficer.firstName.trim()) {
      setLocalError("Processing officer last and first name are required.");
      return;
    }
    if (!approvingOfficer.lastName.trim() || !approvingOfficer.firstName.trim()) {
      setLocalError("Approving officer last and first name are required.");
      return;
    }
    onConfirm({
      signature: canvasRef.current.toDataURL("image/png"),
      processingOfficer,
      approvingOfficer,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="gov-card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Approve application</h2>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
          Approving {applicantName || "this applicant"} will create their PWD
          account. Capture the signature and officers below.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">
                PWD signature<span className="text-red-600"> *</span>
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs font-semibold text-[color:var(--gov-accent)]"
              >
                Clear
              </button>
            </div>
            <canvas
              ref={canvasRef}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerCancel={endDraw}
              onPointerLeave={endDraw}
              style={{ touchAction: "none" }}
              className="mt-2 h-64 w-full cursor-crosshair touch-none rounded-xl border border-dashed border-[color:var(--gov-border)] bg-white"
            />
            <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
              Sign within the box using your pen, mouse, or finger.
            </p>
          </div>

          <OfficerInputs
            title="Processing Officer"
            value={processingOfficer}
            onChange={setProcessingOfficer}
          />
          <OfficerInputs
            title="Approving Officer"
            value={approvingOfficer}
            onChange={setApprovingOfficer}
          />

          {localError || error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {localError || error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Approving…" : "Approve & create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
