import { disabilityLabel } from "../../constants/disability.js";
import DigitalIdCard from "./DigitalIdCard.jsx";
import SubsidiesSection from "./SubsidiesSection.jsx";

const Row = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
      {label}
    </p>
    <p className="mt-1 text-sm text-[color:var(--gov-text)]">{value || "—"}</p>
  </div>
);

const VerifyTag = ({ verified }) =>
  verified ? (
    <span className="ml-2 text-xs font-semibold text-green-600">Verified</span>
  ) : (
    <span className="ml-2 text-xs font-semibold text-amber-600">Not verified</span>
  );

export default function PwdDetailModal({ profile, onClose }) {
  if (!profile) return null;
  const data = profile.data ?? {};
  const initials =
    (profile.full_name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "PWD";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="gov-card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gov-primary)] text-base font-semibold text-white">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">{profile.full_name || "—"}</h2>
              <p className="text-sm text-[color:var(--gov-muted)]">
                {profile.application?.application_number || "No application no."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs font-semibold"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
              Mobile number
              <VerifyTag verified={profile.contact_verified} />
            </p>
            <p className="mt-1 text-sm text-[color:var(--gov-text)]">
              {profile.contact_number || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
              Personal email
              <VerifyTag verified={profile.personal_email_verified} />
            </p>
            <p className="mt-1 text-sm text-[color:var(--gov-text)]">
              {profile.personal_email || "—"}
            </p>
          </div>
          <Row label="Address" value={profile.address} />
          <Row label="Barangay" value={profile.barangay} />
          <Row label="Birthdate" value={profile.birthdate} />
          <Row label="Sex" value={profile.sex} />
          <Row label="Civil status" value={profile.civil_status} />
          <Row
            label="Disability"
            value={disabilityLabel(data.disabilityTypes)}
          />
          <Row
            label="Application status"
            value={profile.application?.status}
          />
        </div>

        <SubsidiesSection pwdId={profile.id} />

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
            Digital ID
          </h3>
          <div className="mt-3">
            <DigitalIdCard profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
