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

// Standalone signature pad. Reports the drawing via onChange (PNG data URL or
// null). Restores a previous drawing from initialDataUrl when remounted.
function SignaturePad({ initialDataUrl, onChange }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef(null);
  const [hasInk, setHasInk] = useState(Boolean(initialDataUrl));

  useEffect(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = initialDataUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const points = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    points.forEach((p) => {
      const pos = posOf(p);
      ctx.beginPath();
      ctx.moveTo(lastRef.current.x, lastRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastRef.current = pos;
    });
    if (!hasInk) setHasInk(true);
  };

  const endDraw = (e) => {
    drawingRef.current = false;
    lastRef.current = null;
    canvasRef.current?.releasePointerCapture?.(e.pointerId);
    onChange?.(canvasRef.current.toDataURL("image/png"));
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasInk(false);
    onChange?.(null);
  };

  return (
    <div>
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={clearPad}
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
        className="mt-1 h-56 w-full cursor-crosshair touch-none rounded-xl border border-dashed border-[color:var(--gov-border)] bg-white"
      />
    </div>
  );
}

const STEPS = ["PWD signature", "Officers", "Approving signature"];

export default function ApproveApplicationModal({
  applicantName,
  onCancel,
  onConfirm,
  isSubmitting,
  error,
}) {
  const [step, setStep] = useState(1);
  const [pwdSignature, setPwdSignature] = useState(null);
  const [approvingSignature, setApprovingSignature] = useState(null);
  const [processingOfficer, setProcessingOfficer] = useState(emptyOfficer);
  const [approvingOfficer, setApprovingOfficer] = useState(emptyOfficer);
  const [localError, setLocalError] = useState("");

  const officersValid =
    processingOfficer.lastName.trim() &&
    processingOfficer.firstName.trim() &&
    approvingOfficer.lastName.trim() &&
    approvingOfficer.firstName.trim();

  const goNext = () => {
    setLocalError("");
    if (step === 1) {
      if (!pwdSignature) {
        setLocalError("The PWD must sign before continuing.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!officersValid) {
        setLocalError("Processing and approving officer names are required.");
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setLocalError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleConfirm = () => {
    setLocalError("");
    if (!approvingSignature) {
      setLocalError("The approving officer must sign before approving.");
      return;
    }
    onConfirm({
      signature: pwdSignature,
      approvingSignature,
      processingOfficer,
      approvingOfficer,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="gov-card w-full max-w-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Approve application</h2>
          <span className="text-xs font-semibold text-[color:var(--gov-muted)]">
            Step {step} of 3 · {STEPS[step - 1]}
          </span>
        </div>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
          Approving {applicantName || "this applicant"} will create their PWD
          account.
        </p>

        <div className="mt-5">
          {step === 1 ? (
            <div>
              <label className="text-sm font-semibold">
                PWD signature<span className="text-red-600"> *</span>
              </label>
              <SignaturePad
                initialDataUrl={pwdSignature}
                onChange={setPwdSignature}
              />
              <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
                Have the applicant sign within the box, then tap Next.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
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
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <label className="text-sm font-semibold">
                Approving officer signature<span className="text-red-600"> *</span>
              </label>
              <SignaturePad
                initialDataUrl={approvingSignature}
                onChange={setApprovingSignature}
              />
              <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
                This signature appears on the issued digital ID.
              </p>
            </div>
          ) : null}

          {localError || error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {localError || error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={step === 1 ? onCancel : goBack}
            disabled={isSubmitting}
            className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !approvingSignature}
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Approving…" : "Approve & create account"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
