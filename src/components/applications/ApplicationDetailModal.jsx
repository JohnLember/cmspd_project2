import { useEffect } from "react";
import { X } from "lucide-react";
import { DISABILITY_LABELS } from "../../constants/disability.js";
import StatusBadge from "../ui/StatusBadge.jsx";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// Option value -> label maps, mirroring the application form's choices.
const APP_TYPE = { new: "New Applicant", renewal: "Renewal" };
const SEX = { female: "Female", male: "Male", "prefer-not": "Prefer not to say" };
const CIVIL = {
  single: "Single",
  married: "Married",
  widowed: "Widowed",
  separated: "Separated",
  cohabitation: "Cohabitation",
};
const CAUSE_INBORN = {
  autism: "Autism",
  adhd: "ADHD",
  "cerebral-palsy": "Cerebral Palsy",
  "down-syndrome": "Down Syndrome",
  other: "Other",
};
const CAUSE_ACQUIRED = {
  "chronic-illness": "Chronic Illness",
  "cerebral-palsy": "Cerebral Palsy",
  injury: "Injury",
  other: "Other",
};
const EDUCATION = {
  none: "No formal education",
  elementary: "Elementary",
  "high-school": "High School",
  "senior-high": "Senior High",
  college: "College",
  vocational: "Vocational",
  postgrad: "Postgraduate",
};
const EMP_STATUS = {
  employed: "Employed",
  "self-employed": "Self-employed",
  unemployed: "Unemployed",
  student: "Student",
};
const EMP_TYPE = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contractual: "Contractual",
  seasonal: "Seasonal",
};
const EMP_CATEGORY = {
  government: "Government",
  private: "Private",
  ngo: "NGO / Cooperative",
};
const OCCUPATION = {
  managers: "Managers",
  professionals: "Professionals",
  technicians: "Technicians and Associate Professionals",
  clerical: "Clerical Support Workers",
  "service-sales": "Service and Sales Workers",
  "skilled-agri": "Skilled Agricultural, Forestry and Fishery Workers",
  "craft-trade": "Craft and Related Trade Workers",
  "plant-machine": "Plant and Machine Operators and Assemblers",
  elementary: "Elementary Occupations",
  "armed-forces": "Armed Forces Occupations",
};
const ACCOMPLISHED_BY = { applicant: "Applicant", guardian: "Guardian" };

const labelOf = (map, value) => (value ? map[value] || value : "");
const labelList = (map, arr) =>
  Array.isArray(arr) && arr.length
    ? arr.map((v) => map[v] || v).join(", ")
    : "";
const nameOf = (first, middle, last) =>
  [first, middle, last]
    .map((p) => (p || "").trim())
    .filter(Boolean)
    .join(" ");

const Field = ({ label, value, full }) => (
  <div className={full ? "sm:col-span-2" : undefined}>
    <p className="text-xs font-medium text-[color:var(--gov-muted)]">{label}</p>
    <p className="mt-0.5 text-sm text-[color:var(--gov-text)]">
      {value === undefined || value === null || value === "" ? "—" : value}
    </p>
  </div>
);

const Section = ({ title, cols = 2, children }) => (
  <section>
    <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
      {title}
    </h3>
    <div
      className={`mt-3 grid gap-4 ${
        cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      {children}
    </div>
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
              <span className="text-xs text-[color:var(--gov-muted)]">
                Submitted {fmtDate(application.submitted_at)}
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
          <Section title="Application details">
            <Field label="Application type" value={labelOf(APP_TYPE, d.appType)} />
          </Section>

          <Section title="Personal information">
            <Field label="First name" value={d.firstName} />
            <Field label="Last name" value={d.lastName} />
            <Field label="Middle name" value={d.middleName} />
            <Field label="Suffix" value={d.suffix} />
            <Field label="Birthdate" value={d.birthdate} />
            <Field label="Sex" value={labelOf(SEX, d.gender)} />
            <Field label="Civil status" value={labelOf(CIVIL, d.civilStatus)} />
          </Section>

          <Section title="Disability profile">
            <Field
              label="Type of disability"
              value={labelList(DISABILITY_LABELS, d.disabilityTypes)}
              full
            />
            <Field
              label="Other disability details"
              value={d.disabilityDetail}
              full
            />
            <Field
              label="Cause of disability (Cognitive / Inborn)"
              value={labelList(CAUSE_INBORN, d.causeInborn)}
            />
            <Field
              label="Other inborn cause details"
              value={d.causeInbornOther}
            />
            <Field
              label="Cause of disability (Acquired)"
              value={labelList(CAUSE_ACQUIRED, d.causeAcquired)}
            />
            <Field
              label="Other acquired cause details"
              value={d.causeAcquiredOther}
            />
          </Section>

          <Section title="Address & contact">
            <Field
              label="Complete address"
              value={d.street || application.address}
              full
            />
            <Field label="Barangay" value={d.barangay || application.barangay} />
            <Field
              label="Municipality"
              value={d.municipality || application.municipality}
            />
            <Field label="Province" value={d.province || application.province} />
            <Field
              label="Postal code"
              value={d.postal || application.postal_code}
            />
            <Field
              label="Mobile number"
              value={d.contactNumber || application.contact_number}
            />
            <Field
              label="Email address"
              value={d.emailAddress || application.email}
            />
          </Section>

          <Section title="Education & employment">
            <Field
              label="Educational attainment"
              value={labelOf(EDUCATION, d.education)}
            />
            <Field
              label="Status of employment"
              value={labelOf(EMP_STATUS, d.employmentStatus)}
            />
            <Field
              label="Types of employment"
              value={labelOf(EMP_TYPE, d.employmentType)}
            />
            <Field
              label="Category of employment"
              value={labelOf(EMP_CATEGORY, d.employmentCategory)}
            />
            <Field
              label="Occupation"
              value={labelOf(OCCUPATION, d.occupation)}
            />
            <Field label="Other, specify" value={d.occupationOther} />
          </Section>

          <Section title="Family, organization & references">
            <Field label="Organization affiliated" value={d.orgAffiliated} full />
            <Field label="Contact person" value={d.contactPerson} />
            <Field label="Tel. nos." value={d.telNos} />
            <Field label="Office address" value={d.officeAddress} full />
            <Field label="SSS no." value={d.sssNo} />
            <Field label="GIS no." value={d.gisNo} />
            <Field label="PAG-IBIG no." value={d.pagibigNo} />
            <Field label="PSN no." value={d.psnNo} />
            <Field label="PhilHealth no." value={d.philhealthNo} />
          </Section>

          <Section title="Parents & guardian" cols={3}>
            <Field
              label="Father's name"
              value={nameOf(d.fatherFirst, d.fatherMiddle, d.fatherLast)}
            />
            <Field
              label="Mother's name"
              value={nameOf(d.motherFirst, d.motherMiddle, d.motherLast)}
            />
            <Field
              label="Guardian's name"
              value={nameOf(d.guardianFirst, d.guardianMiddle, d.guardianLast)}
            />
            <Field label="Guardian's mobile number" value={d.guardianContact} />
            <Field
              label="Accomplished by"
              value={labelOf(ACCOMPLISHED_BY, d.accomplishedBy)}
            />
            <Field
              label="Accomplished by (name)"
              value={nameOf(d.accompFirst, d.accompMiddle, d.accompLast)}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}
