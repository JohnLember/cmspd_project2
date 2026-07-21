import { useEffect, useMemo, useRef, useState } from "react";
import { PWD_REQUIREMENTS } from "../../constants/requirements.js";

const officerFields = [
  ["lastName", "Last name"],
  ["firstName", "First name"],
  ["middleName", "Middle name"],
];

const emptyOfficer = { lastName: "", firstName: "", middleName: "" };

function OfficerInputs({ title, value, onChange }) {
  return (
    <fieldset className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {officerFields.map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-[color:var(--gov-muted)]">
              {label}
              {key !== "middleName" ? (
                <span className="text-[color:var(--gov-danger-fg)]"> *</span>
              ) : null}
            </label>
            <input
              type="text"
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="gov-input"
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
          className="btn btn-ghost h-9 px-3 text-xs"
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
        className="mt-1 h-56 w-full cursor-crosshair touch-none rounded-[var(--radius-md)] border border-dashed border-[color:var(--gov-border-strong)] bg-white"
      />
    </div>
  );
}

// Lets the officer link the new ward to an existing guardian account (avoiding
// duplicate guardian logins) or deliberately create a new one.
function GuardianStep({ guardianInfo, matches, loading, choice, onChoice }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4">
        <p className="text-xs font-medium text-[color:var(--gov-muted)]">
          Guardian on this application
        </p>
        <p className="mt-1 text-sm font-semibold">
          {guardianInfo?.fullName || "—"}
          {guardianInfo?.phone ? (
            <span className="font-normal text-[color:var(--gov-muted)]">
              {" · "}
              {guardianInfo.phone}
            </span>
          ) : null}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--gov-muted)]">
          Checking for an existing guardian account…
        </p>
      ) : (
        <div className="space-y-2">
          {matches.length > 0 ? (
            <p className="text-sm font-medium">
              {matches.length === 1
                ? "A matching guardian account already exists:"
                : "Matching guardian accounts already exist:"}
            </p>
          ) : (
            <p className="text-sm text-[color:var(--gov-muted)]">
              No existing guardian account matched. A new one will be created.
            </p>
          )}

          {matches.map((m) => {
            const selected =
              choice.mode === "existing" && choice.guardianId === m.guardianId;
            return (
              <label
                key={m.guardianId}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-3 has-[:checked]:border-[color:var(--gov-primary)]"
              >
                <input
                  type="radio"
                  name="guardian-link"
                  checked={selected}
                  onChange={() =>
                    onChoice({ mode: "existing", guardianId: m.guardianId })
                  }
                  className="mt-0.5 h-[1.15rem] w-[1.15rem] accent-[color:var(--gov-primary)]"
                />
                <span className="text-sm">
                  <span className="font-semibold">{m.name || "Guardian"}</span>
                  <span className="text-[color:var(--gov-muted)]">
                    {m.phone ? ` · ${m.phone}` : " · no phone on record"}
                    {` · ${m.wardCount} ward${m.wardCount === 1 ? "" : "s"}`}
                  </span>
                  {m.phoneHit ? (
                    <span className="ml-2 gov-badge gov-badge--neutral">
                      phone match
                    </span>
                  ) : (
                    <span className="ml-2 gov-badge gov-badge--neutral">
                      name match
                    </span>
                  )}
                  <span className="mt-0.5 block text-xs text-[color:var(--gov-muted)]">
                    Link this ward to {m.email}
                  </span>
                </span>
              </label>
            );
          })}

          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-3 has-[:checked]:border-[color:var(--gov-primary)]">
            <input
              type="radio"
              name="guardian-link"
              checked={choice.mode === "new"}
              onChange={() => onChoice({ mode: "new" })}
              className="mt-0.5 h-[1.15rem] w-[1.15rem] accent-[color:var(--gov-primary)]"
            />
            <span className="text-sm">
              <span className="font-semibold">Create a new guardian account</span>
              <span className="mt-0.5 block text-xs text-[color:var(--gov-muted)]">
                Use this if the guardian above is a different person.
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

export default function ApproveApplicationModal({
  applicantName,
  guardianInfo,
  guardianMatches = [],
  guardianMatchesLoading = false,
  initialRequirements = {},
  onSavePending,
  onCancel,
  onConfirm,
  isSubmitting,
  error,
}) {
  const hasGuardian = Boolean(guardianInfo);
  // Requirements gate the whole flow; the guardian-resolution step only appears
  // when the application names a guardian.
  const steps = hasGuardian
    ? ["Requirements", "PWD signature", "Officers", "Guardian", "Approving signature"]
    : ["Requirements", "PWD signature", "Officers", "Approving signature"];
  const totalSteps = steps.length;

  const [step, setStep] = useState(1);
  const [requirements, setRequirements] = useState(() =>
    Object.fromEntries(
      PWD_REQUIREMENTS.map((r) => [r, Boolean(initialRequirements?.[r])])
    )
  );
  const allRequirementsMet = PWD_REQUIREMENTS.every((r) => requirements[r]);
  const [pwdSignature, setPwdSignature] = useState(null);
  const [approvingSignature, setApprovingSignature] = useState(null);
  const [processingOfficer, setProcessingOfficer] = useState(emptyOfficer);
  const [approvingOfficer, setApprovingOfficer] = useState(emptyOfficer);
  // Guardian linking choice. Null until the officer picks one; we then fall back
  // to a sensible default (link to a phone match if one exists, else create new
  // so two different people who share a name never silently merge).
  const [guardianChoice, setGuardianChoice] = useState(null);
  const [localError, setLocalError] = useState("");

  const stepName = steps[step - 1];

  const defaultGuardianChoice = useMemo(() => {
    const phoneMatch = guardianMatches.find((m) => m.phoneHit);
    return phoneMatch
      ? { mode: "existing", guardianId: phoneMatch.guardianId }
      : { mode: "new" };
  }, [guardianMatches]);
  const effectiveChoice = guardianChoice ?? defaultGuardianChoice;

  const officersValid =
    processingOfficer.lastName.trim() &&
    processingOfficer.firstName.trim() &&
    approvingOfficer.lastName.trim() &&
    approvingOfficer.firstName.trim();

  const goNext = () => {
    setLocalError("");
    if (stepName === "Requirements") {
      if (!allRequirementsMet) {
        setLocalError(
          "All requirements must be presented before approving. Save & keep pending if some are still missing."
        );
        return;
      }
    } else if (stepName === "PWD signature") {
      if (!pwdSignature) {
        setLocalError("The PWD must sign before continuing.");
        return;
      }
    } else if (stepName === "Officers") {
      if (!officersValid) {
        setLocalError("Processing and approving officer names are required.");
        return;
      }
    }
    setStep((s) => Math.min(totalSteps, s + 1));
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
      guardianChoice: hasGuardian ? effectiveChoice : null,
    });
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSubmitting, onCancel]);

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div
        className="gov-backdrop absolute inset-0"
        onClick={() => !isSubmitting && onCancel()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Approve application"
        className="gov-overlay relative w-full max-w-2xl p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Approve application</h2>
          <span className="gov-badge gov-badge--neutral">
            Step {step} of {totalSteps} · {stepName}
          </span>
        </div>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
          Approving {applicantName || "this applicant"} will create their PWD
          account.
        </p>

        <div className="mt-5">
          {stepName === "Requirements" ? (
            <div>
              <p className="text-sm text-[color:var(--gov-muted)]">
                Tick each document the applicant has presented at the office. All
                must be checked to approve; otherwise save the progress and the
                application stays pending.
              </p>
              <ul className="mt-4 space-y-2">
                {PWD_REQUIREMENTS.map((req) => (
                  <li key={req}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-3 has-[:checked]:border-[color:var(--gov-primary)]">
                      <input
                        type="checkbox"
                        checked={requirements[req]}
                        onChange={(e) =>
                          setRequirements((prev) => ({
                            ...prev,
                            [req]: e.target.checked,
                          }))
                        }
                        className="h-[1.15rem] w-[1.15rem] accent-[color:var(--gov-primary)]"
                      />
                      <span className="text-sm">{req}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {stepName === "PWD signature" ? (
            <div>
              <label className="text-sm font-semibold">
                PWD signature<span className="text-[color:var(--gov-danger-fg)]"> *</span>
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

          {stepName === "Officers" ? (
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

          {stepName === "Guardian" ? (
            <GuardianStep
              guardianInfo={guardianInfo}
              matches={guardianMatches}
              loading={guardianMatchesLoading}
              choice={effectiveChoice}
              onChoice={setGuardianChoice}
            />
          ) : null}

          {stepName === "Approving signature" ? (
            <div>
              <label className="text-sm font-semibold">
                Approving officer signature<span className="text-[color:var(--gov-danger-fg)]"> *</span>
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
            <div
              role="alert"
              className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
            >
              {localError || error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={step === 1 ? onCancel : goBack}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="flex items-center gap-2">
            {stepName === "Requirements" ? (
              <button
                type="button"
                onClick={() => onSavePending(requirements)}
                disabled={isSubmitting}
                className="btn btn-secondary"
              >
                Save &amp; keep pending
              </button>
            ) : null}
            {step < totalSteps ? (
              <button type="button" onClick={goNext} className="btn btn-primary">
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting || !approvingSignature}
                className="btn btn-primary"
              >
                {isSubmitting ? "Approving…" : "Approve & create account"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
