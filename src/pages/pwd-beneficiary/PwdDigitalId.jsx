import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Printer, XCircle } from "lucide-react";
import { getMyProfile } from "../../services/supabase/profile.js";
import DigitalIdCard from "../../components/pwd/DigitalIdCard.jsx";
import { getMissingIdFields } from "../../components/pwd/digitalIdFields.js";
import { useRealtime } from "../../hooks/useRealtime.js";

export default function PwdDigitalId() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { profile: row, error: loadError } = await getMyProfile();
    if (loadError) {
      setError(loadError.message || "Unable to load your digital ID.");
    } else {
      setProfile(row);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live: the ID reflects PDAO edits to this beneficiary's record immediately.
  useRealtime("profiles", load);

  const missingFields = profile ? getMissingIdFields(profile) : [];
  const isComplete = profile && missingFields.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Digital PWD ID</h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Present this ID for PWD discounts and services. You can print it or
            save it as a PDF.
          </p>
        </div>
        {isComplete ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print / Save as PDF
          </button>
        ) : null}
      </header>

      {isLoading ? (
        <div className="gov-card p-6 print:hidden">
          <div className="gov-skeleton h-6 w-48" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)] print:hidden"
        >
          {error}
        </div>
      ) : !profile ? null : !isComplete ? (
        <section className="gov-card p-6 print:hidden">
          <h3 className="text-lg font-semibold">Complete your information first</h3>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Your Digital PWD ID becomes available once all required details are
            filled in. Blood type is optional. Please complete the following:
          </p>
          <ul className="mt-4 space-y-2.5">
            {missingFields.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-sm">
                <XCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gov-danger)]"
                  aria-hidden="true"
                />
                <span>
                  {f.label}
                  {!f.fixable ? (
                    <span className="ml-1 text-xs text-[color:var(--gov-muted)]">
                      (from your application — contact PDAO to update)
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {missingFields.some((f) => f.fixable) ? (
            <Link
              to="/app/pwd-beneficiary/profile"
              className="btn btn-primary mt-6"
            >
              Go to my profile
            </Link>
          ) : null}
        </section>
      ) : (
        <section className="gov-card p-6 print:border-0 print:p-0">
          <DigitalIdCard profile={profile} />
        </section>
      )}
    </div>
  );
}
