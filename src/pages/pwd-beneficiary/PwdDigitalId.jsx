import { useEffect, useState } from "react";
import { getMyProfile } from "../../services/supabase/profile.js";
import DigitalIdCard from "../../components/pwd/DigitalIdCard.jsx";

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
          {profile ? (
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
      ) : profile ? (
        <section className="gov-card rounded-2xl p-6 print:border-0 print:p-0 print:shadow-none">
          <DigitalIdCard profile={profile} />
        </section>
      ) : null}
    </div>
  );
}
