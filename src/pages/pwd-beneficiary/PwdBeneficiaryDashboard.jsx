import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Bell, IdCard, User } from "lucide-react";
import { getMyProfile } from "../../services/supabase/profile.js";
import { getMissingIdFields } from "../../components/pwd/digitalIdFields.js";
import AnnouncementsFeed from "../../components/ui/AnnouncementsFeed.jsx";

export default function PwdBeneficiaryDashboard() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { profile: row } = await getMyProfile();
      if (!isMounted) return;
      setProfile(row);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = (profile?.full_name || "").split(" ")[0];
  const idReady = profile && getMissingIdFields(profile).length === 0;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
          Welcome{firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mt-1 text-[color:var(--gov-muted)]">
          View your Digital ID and the latest announcements from PDAO.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/app/pwd-beneficiary/digital-id"
          className="group gov-card flex items-center justify-between gap-4 p-5 transition-colors hover:border-[color:var(--gov-primary)]"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]">
              <IdCard className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-[color:var(--gov-text)]">Digital PWD ID</p>
              <p className="text-sm text-[color:var(--gov-muted)]">
                {isLoading
                  ? "Checking status…"
                  : idReady
                  ? "Ready to view and print"
                  : "Complete your profile to activate"}
              </p>
            </div>
          </div>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-[color:var(--gov-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--gov-primary)] motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>

        <Link
          to="/app/pwd-beneficiary/profile"
          className="group gov-card flex items-center justify-between gap-4 p-5 transition-colors hover:border-[color:var(--gov-primary)]"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]">
              <User className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-[color:var(--gov-text)]">My profile</p>
              <p className="text-sm text-[color:var(--gov-muted)]">
                Update your details and account settings
              </p>
            </div>
          </div>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-[color:var(--gov-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--gov-primary)] motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </section>

      <section className="gov-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-[color:var(--gov-text)]">
            <Bell className="h-4 w-4 text-[color:var(--gov-primary)]" aria-hidden="true" />
            Latest announcements
          </h3>
          <Link
            to="/app/pwd-beneficiary/announcements"
            className="rounded text-sm font-semibold text-[color:var(--gov-primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4">
          <AnnouncementsFeed emptyText="No announcements from PDAO yet." />
        </div>
      </section>
    </div>
  );
}
