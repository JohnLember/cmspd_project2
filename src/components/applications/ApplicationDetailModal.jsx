import { useEffect } from "react";
import { X } from "lucide-react";
import { disabilityLabel } from "../../constants/disability.js";
import StatusBadge from "../ui/StatusBadge.jsx";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const typeLabel = (value) =>
  value === "renewal"
    ? "Renewal"
    : value === "new"
    ? "New Applicant"
    : "—";

const nameOf = (first, middle, last, suffix) =>
  [first, middle, last, suffix]
    .map((p) => (p || "").trim())
    .filter(Boolean)
    .join(" ") || "—";

const joinList = (arr, otherText) => {
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  const parts = arr.map((v) =>
    v === "other" && otherText ? `Other: ${otherText}` : v
  );
  return parts.join(", ");
};

const Field = ({ label, value, full }) => (
  <div className={full ? "sm:col-span-2" : undefined}>
    <p className="text-xs font-medium text-[color:var(--gov-muted)]">{label}</p>
    <p className="mt-0.5 text-sm text-[color:var(--gov-text)]">
      {value === undefined || value === null || value === "" ? "—" : value}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <section>
    <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
      {title}
    </h3>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const displayId = (row) =>
  row.application_number || `APP-${(row.id || "").slice(0, 8).toUpperCase()}`;

export default function ApplicationDetailModal({ application, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!application) return null;
  const d = application.data ?? {};
  const status = application.status || "pending";

  const guardianName = nameOf(d.guardianFirst, d.guardianMiddle, d.guardianLast);
  const hasFamily =
    d.fatherFirst ||
    d.fatherLast ||
    d.motherFirst ||
    d.motherLast ||
    d.guardianFirst ||
    d.guardianLast;
  const hasGovIds =
    d.sssNo || d.gisNo || d.pagibigNo || d.psnNo || d.philhealthNo;
  const hasWorkEd =
    d.education ||
    d.employmentStatus ||
    d.employmentType ||
    d.employmentCategory ||
    d.occupation;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div
        className="gov-backdrop absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Application ${displayId(application)}`}
        className="gov-overlay relative max-h-[92vh] w-full max-w-3xl overflow-y-auto p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {application.applicant_name || "—"}
            </h2>
            <p className="font-mono text-xs text-[color:var(--gov-muted)]">
              {displayId(application)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <span className="gov-badge gov-badge--neutral">
                {typeLabel(d.appType)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost h-10 w-10 px-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 space-y-6 border-t border-[color:var(--gov-border)] pt-6">
          <Section title="Personal information">
            <Field label="First name" value={d.firstName} />
            <Field label="Middle name" value={d.middleName} />
            <Field label="Last name" value={d.lastName} />
            <Field label="Suffix" value={d.suffix} />
            <Field label="Date of birth" value={d.birthdate} />
            <Field label="Sex" value={d.gender} />
            <Field label="Civil status" value={d.civilStatus} />
          </Section>

          <Section title="Disability">
            <Field
              label="Type(s)"
              value={disabilityLabel(d.disabilityTypes)}
              full
            />
            <Field label="Details" value={d.disabilityDetail} full />
            <Field
              label="Cause — congenital / inborn"
              value={joinList(d.causeInborn, d.causeInbornOther)}
            />
            <Field
              label="Cause — acquired"
              value={joinList(d.causeAcquired, d.causeAcquiredOther)}
            />
          </Section>

          <Section title="Address & contact">
            <Field
              label="Address"
              value={application.address || d.street}
              full
            />
            <Field label="Barangay" value={application.barangay || d.barangay} />
            <Field
              label="Municipality"
              value={application.municipality || d.municipality}
            />
            <Field
              label="Province"
              value={application.province || d.province}
            />
            <Field
              label="Postal code"
              value={application.postal_code || d.postal}
            />
            <Field
              label="Mobile number"
              value={application.contact_number || d.contactNumber}
            />
            <Field
              label="Email"
              value={application.email || d.emailAddress}
            />
          </Section>

          {hasWorkEd ? (
            <Section title="Education & employment">
              <Field label="Educational attainment" value={d.education} />
              <Field label="Employment status" value={d.employmentStatus} />
              <Field label="Employment type" value={d.employmentType} />
              <Field label="Category" value={d.employmentCategory} />
              <Field
                label="Occupation"
                value={
                  d.occupation === "other" ? d.occupationOther : d.occupation
                }
                full
              />
            </Section>
          ) : null}

          {hasGovIds ? (
            <Section title="Government IDs & membership">
              <Field label="SSS no." value={d.sssNo} />
              <Field label="GSIS no." value={d.gisNo} />
              <Field label="Pag-IBIG no." value={d.pagibigNo} />
              <Field label="PhilHealth no." value={d.philhealthNo} />
              <Field label="PSN no." value={d.psnNo} />
              <Field label="Organization affiliated" value={d.orgAffiliated} />
            </Section>
          ) : null}

          {hasFamily ? (
            <Section title="Family">
              <Field
                label="Father"
                value={nameOf(d.fatherFirst, d.fatherMiddle, d.fatherLast)}
              />
              <Field
                label="Mother"
                value={nameOf(d.motherFirst, d.motherMiddle, d.motherLast)}
              />
              <Field label="Guardian" value={guardianName} />
              <Field label="Guardian mobile" value={d.guardianContact} />
            </Section>
          ) : null}

          <Section title="Emergency contact & filing">
            <Field label="Contact person" value={d.contactPerson} />
            <Field label="Contact tel. no." value={d.telNos} />
            <Field label="Office address" value={d.officeAddress} full />
            <Field
              label="Accomplished by"
              value={
                d.accomplishedBy === "guardian"
                  ? "Guardian"
                  : d.accomplishedBy === "applicant"
                  ? "Applicant"
                  : d.accomplishedBy
              }
            />
            <Field
              label="Filed by"
              value={nameOf(d.accompFirst, d.accompMiddle, d.accompLast)}
            />
            <Field
              label="Submitted"
              value={fmtDate(application.submitted_at)}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}
