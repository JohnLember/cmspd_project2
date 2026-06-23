import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyProfile } from "../../services/supabase/profile.js";
import DigitalIdCard from "../../components/pwd/DigitalIdCard.jsx";
import { getMissingIdFields } from "../../components/pwd/digitalIdFields.js";

export default function PwdDigitalId() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { profile: row, error: loadError } = await getMyProfile();
      if (!isMounted) return;
      if (loadError) {
        setError(loadError.message || "Unable to load your digital ID.");
      } else {
        setProfile(row);
      }
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const missingFields = profile ? getMissingIdFields(profile) : [];
  const isComplete = profile && missingFields.length === 0;

  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Digital PWD ID</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Present this ID for PWD discounts and services. You can print it or
              save it as a PDF.
            </p>
          </div>
          {isComplete ? (
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Print / Save as PDF
            </button>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <div className="gov-card rounded-2xl p-6 text-sm text-[color:var(--gov-muted)] print:hidden">
          Loading your digital ID…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 print:hidden">
          {error}
        </div>
      ) : !profile ? null : !isComplete ? (
        <section className="gov-card rounded-2xl p-6 print:hidden">
          <h3 className="text-lg font-semibold">Complete your information first</h3>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Your Digital PWD ID becomes available once all required details are
            filled in. Blood type is optional. Please complete the following:
          </p>
          <ul className="mt-4 space-y-2">
            {missingFields.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-0.5 text-red-500">
                  ✗
                </span>
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
              className="mt-5 inline-block rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Go to my profile
            </Link>
          ) : null}
        </section>
      ) : (
        <section className="gov-card rounded-2xl p-6 print:border-0 print:p-0 print:shadow-none">
          <DigitalIdCard profile={profile} />
        </section>
      )}
    </div>
  );
}
