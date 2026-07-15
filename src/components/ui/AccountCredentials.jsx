import { useState } from "react";
import { toast } from "react-toastify";
import { Copy, Eye, EyeOff, KeyRound, RotateCcw } from "lucide-react";
import { getAccountCredentials } from "../../services/supabase/accounts.js";

const copy = async (value, label) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`, { autoClose: 1500 });
  } catch {
    toast.error("Unable to copy.");
  }
};

// PDAO-only panel: reveal a beneficiary's login email + temporary password, with
// a reset fallback for when the user has changed their password.
export default function AccountCredentials({ targetId, type }) {
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const reveal = async () => {
    setLoading(true);
    const { ok, email, password, error } = await getAccountCredentials({
      targetId,
      type,
    });
    if (!ok) toast.error(error?.message || "Unable to load credentials.");
    else setCreds({ email, password });
    setLoading(false);
  };

  const reset = async () => {
    setResetting(true);
    const { ok, email, password, error } = await getAccountCredentials({
      targetId,
      type,
      reset: true,
    });
    if (!ok) {
      toast.error(error?.message || "Unable to reset password.");
    } else {
      setCreds({ email, password });
      setShowPw(true);
      toast.success("Password reset to the temporary password.");
    }
    setResetting(false);
  };

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-[color:var(--gov-text)]">Login credentials</h3>
      {!creds ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={reveal}
            disabled={loading}
            className="btn btn-secondary"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {loading ? "Loading…" : "Reveal login & temporary password"}
          </button>
          <p className="mt-2 text-xs text-[color:var(--gov-muted)]">
            Share these with the beneficiary if they cannot sign in.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4">
          <div>
            <p className="text-xs font-medium text-[color:var(--gov-muted)]">
              Login email
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-[color:var(--gov-text)]">
                {creds.email}
              </span>
              <button
                type="button"
                onClick={() => copy(creds.email, "Login email")}
                className="btn btn-ghost h-8 w-8 px-0"
                aria-label="Copy login email"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[color:var(--gov-muted)]">
              Temporary password
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-[color:var(--gov-text)]">
                {showPw ? creds.password : "•".repeat(creds.password.length)}
              </span>
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="btn btn-ghost h-8 w-8 px-0"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => copy(creds.password, "Password")}
                className="btn btn-ghost h-8 w-8 px-0"
                aria-label="Copy password"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[color:var(--gov-border)] pt-3">
            <p className="text-xs text-[color:var(--gov-muted)]">
              If this password no longer works, reset it.
            </p>
            <button
              type="button"
              onClick={reset}
              disabled={resetting}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {resetting ? "Resetting…" : "Reset password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
