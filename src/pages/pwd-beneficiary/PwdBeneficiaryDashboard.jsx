import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Download,
  Gift,
  HeartHandshake,
  IdCard,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { getMyProfile } from "../../services/supabase/profile.js";
import { getMyGuardians } from "../../services/supabase/guardians.js";
import { getMyAssistance } from "../../services/supabase/recipients.js";
import { DISABILITY_LABELS } from "../../constants/disability.js";
import { getMissingIdFields } from "../../components/pwd/digitalIdFields.js";
import { fmtEventDate } from "../../utils/eventFormat.js";
import { exportReceiptPdf } from "../../utils/receiptPdf.js";
import AnnouncementsFeed from "../../components/ui/AnnouncementsFeed.jsx";
import { useRealtime } from "../../hooks/useRealtime.js";

const guardianInitials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "G";

export default function PwdBeneficiaryDashboard() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guardians, setGuardians] = useState([]);
  const [assistance, setAssistance] = useState([]);

  const load = useCallback(async () => {
    const { profile: row } = await getMyProfile();
    setProfile(row);
    const { guardians: rows } = await getMyGuardians();
    setGuardians(rows ?? []);
    const { recipients } = await getMyAssistance();
    setAssistance(recipients ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live: reflects profile/ID changes made by PDAO without a refresh.
  useRealtime("profiles", load);
  // Live: reflects a linked guardian being deactivated/reactivated.
  useRealtime("guardian_ward_links", load);
  // Live: reflects assistance being marked received by PDAO.
  useRealtime("announcement_recipients", load);

  const downloadReceipt = (r) =>
    exportReceiptPdf({
      receiptNumber: r.receipt_number,
      receivedAt: r.received_at,
      fullName: profile?.full_name,
      pwdId: profile?.pwd_id_number,
      barangay: profile?.barangay,
      item: r.announcement?.item_type || r.announcement?.title || "Assistance",
      quantity: r.quantity,
    });

  const firstName = (profile?.full_name || "").split(" ")[0];
  const idReady = profile && getMissingIdFields(profile).length === 0;
  const disabilityTypes = Array.isArray(profile?.data?.disabilityTypes)
    ? profile.data.disabilityTypes
    : [];

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

      {!isLoading && disabilityTypes.length > 0 ? (
        <section className="gov-card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-[color:var(--gov-text)]">
            <HeartHandshake
              className="h-4 w-4 text-[color:var(--gov-primary)]"
              aria-hidden="true"
            />
            {disabilityTypes.length === 1
              ? "My disability type"
              : "My disability types"}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {disabilityTypes.map((t) => (
              <span key={t} className="gov-badge gov-badge--info">
                {DISABILITY_LABELS[t] || t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && assistance.length > 0 ? (
        <section className="gov-card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-[color:var(--gov-text)]">
            <Gift className="h-4 w-4 text-[color:var(--gov-primary)]" aria-hidden="true" />
            Assistance from PDAO
          </h3>
          <div className="mt-4 space-y-3">
            {assistance.map((r) => {
              const received = r.status === "received";
              const item =
                r.announcement?.item_type || r.announcement?.title || "Assistance";
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[color:var(--gov-text)]">{item}</p>
                      {r.quantity > 1 ? (
                        <span className="gov-badge gov-badge--neutral">x{r.quantity}</span>
                      ) : null}
                      {received ? (
                        <span className="gov-badge gov-badge--success">Received</span>
                      ) : (
                        <span className="gov-badge gov-badge--warning">Pending</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
                      {received
                        ? `Received ${fmtEventDate(
                            (r.received_at || "").slice(0, 10)
                          )}`
                        : r.announcement?.event_date
                        ? `Scheduled ${fmtEventDate(r.announcement.event_date)}`
                        : "Not yet released"}
                    </p>
                  </div>
                  {received && r.receipt_number ? (
                    <button
                      type="button"
                      onClick={() => downloadReceipt(r)}
                      className="btn btn-secondary h-9 px-3 text-xs"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Receipt
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {guardians.length > 0 ? (
        <section className="gov-card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-[color:var(--gov-text)]">
            <ShieldCheck className="h-4 w-4 text-[color:var(--gov-primary)]" aria-hidden="true" />
            {guardians.length === 1 ? "My guardian" : "My guardians"}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {guardians.map((g) => {
              const active = g.guardian_active !== false;
              return (
                <div
                  key={g.id}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--gov-primary)] text-sm font-semibold text-[color:var(--gov-on-primary)]">
                    {guardianInitials(g.guardian_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[color:var(--gov-text)]">
                        {g.guardian_name || "—"}
                      </p>
                      <span
                        className={`gov-badge ${
                          active ? "gov-badge--success" : "gov-badge--danger"
                        }`}
                      >
                        {active ? "Active" : "Deactivated"}
                      </span>
                    </div>
                    {g.relationship ? (
                      <p className="text-xs text-[color:var(--gov-muted)]">
                        {g.relationship}
                      </p>
                    ) : null}
                    {g.guardian_phone ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[color:var(--gov-muted)]">
                        <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {g.guardian_phone}
                      </p>
                    ) : null}
                    {!active ? (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-[color:var(--gov-warning-fg)]">
                        <AlertTriangle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        This guardian account has been deactivated by PDAO.
                        Please coordinate with the PDAO office if unexpected.
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/app/pwd-beneficiary/digital-id"
          className="group card-press gov-card flex items-center justify-between gap-4 p-5 hover:border-[color:var(--gov-primary)]"
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
          className="group card-press gov-card flex items-center justify-between gap-4 p-5 hover:border-[color:var(--gov-primary)]"
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
          <AnnouncementsFeed limit={5} emptyText="No announcements from PDAO yet." />
        </div>
      </section>
    </div>
  );
}
