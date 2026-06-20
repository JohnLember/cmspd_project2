import { Accessibility } from "lucide-react";
import { disabilityLabel } from "../../constants/disability.js";

const fmtDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
};

// "LASTNAME, FIRSTNAME MIDDLENAME" from the application data, falling back to
// the stored full name.
const formatName = (profile) => {
  const d = profile.data ?? {};
  if (d.lastName || d.firstName) {
    const first = [d.firstName, d.middleName, d.suffix].filter(Boolean).join(" ");
    return `${d.lastName || ""}, ${first}`.toUpperCase().trim();
  }
  return (profile.full_name || "—").toUpperCase();
};

const officerName = (o) =>
  o ? [o.firstName, o.middleName, o.lastName].filter(Boolean).join(" ") : "";

const Seal = ({ label }) => (
  <div className="grid h-9 w-9 place-items-center rounded-full border border-green-800 text-center text-[6px] font-semibold leading-none text-green-900">
    {label}
  </div>
);

export default function DigitalIdCard({ profile }) {
  const data = profile.data ?? {};
  const approval = profile.application?.approval ?? null;
  const idNo =
    profile.pwd_id_number || profile.application?.application_number || "—";
  const issued = fmtDate(
    approval?.approvedAt || profile.application?.submitted_at || profile.created_at
  );
  const emergencyName = data.contactPerson || "";
  const emergencyContact = data.telNos || "";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* FRONT */}
      <div className="rounded-lg border-4 border-double border-green-800 bg-[#f6f6ee] p-4 text-[#1a1a1a]">
        <div className="flex items-start gap-2">
          <Accessibility className="h-10 w-10 shrink-0 text-[#1a1a1a]" />
          <div className="flex-1 text-center text-[11px] font-semibold leading-tight">
            <p>Republic of the Philippines</p>
            <p>Province of Agusan del Sur</p>
            <p>Municipality of Loreto</p>
            <p>
              Barangay <span className="underline">{profile.barangay || "—"}</span>
            </p>
          </div>
          <div className="flex gap-1">
            <Seal label="AdS" />
            <Seal label="BP" />
          </div>
        </div>

        <div className="mt-3 flex gap-3">
          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-3 text-[12px]">
              <p>
                <span className="text-gray-600">NAME: </span>
                <span className="font-bold">{formatName(profile)}</span>
              </p>
              <p>
                <span className="text-gray-600">TYPE OF DISABILITY: </span>
                <span className="font-bold">
                  {disabilityLabel(data.disabilityTypes)}
                </span>
              </p>
            </div>
            <div className="mt-3">
              {approval?.signature ? (
                <img
                  src={approval.signature}
                  alt="Signature"
                  className="h-12 object-contain"
                />
              ) : (
                <div className="h-12" />
              )}
              <div className="w-40 border-t border-green-800" />
              <p className="text-[10px] text-gray-600">SIGNATURE</p>
            </div>
          </div>
          <div className="h-28 w-24 shrink-0 overflow-hidden rounded border border-green-800 bg-white">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[9px] text-gray-400">
                No photo
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-[12px]">
          <span className="text-gray-600">ID NO: </span>
          <span className="font-bold underline">{idNo}</span>
        </p>
        <p className="mt-3 text-center text-[11px] font-semibold italic">
          VALID ANYWHERE IN THE COUNTRY
        </p>
      </div>

      {/* BACK */}
      <div className="rounded-lg border-4 border-double border-green-800 bg-[#f6f6ee] p-4 text-[11px] text-[#1a1a1a]">
        <p>
          <span className="font-semibold">ADDRESS:</span>{" "}
          {profile.address || "—"}
        </p>
        <div className="mt-2 flex justify-between gap-2">
          <span>
            <span className="font-semibold">DATE OF BIRTH:</span>{" "}
            {fmtDate(profile.birthdate) || "—"}
          </span>
          <span>
            <span className="font-semibold">SEX:</span>{" "}
            {(profile.sex || "—").toUpperCase()}
          </span>
        </div>
        <div className="mt-1 flex justify-between gap-2">
          <span>
            <span className="font-semibold">DATE ISSUED:</span> {issued || "—"}
          </span>
          <span>
            <span className="font-semibold">BLOOD TYPE:</span> —
          </span>
        </div>

        <p className="mt-4 font-semibold">IN CASE OF EMERGENCY PLEASE NOTIFY:</p>
        <p className="mt-2">
          <span className="font-semibold">NAME:</span> {emergencyName || "—"}
        </p>
        <p>
          <span className="font-semibold">CONTACT NO:</span>{" "}
          {emergencyContact || "—"}
        </p>

        <div className="mt-4 text-center">
          {approval?.approvingSignature ? (
            <img
              src={approval.approvingSignature}
              alt="Approving officer signature"
              className="mx-auto h-10 object-contain"
            />
          ) : null}
          <p className="font-bold uppercase underline">
            {officerName(approval?.approvingOfficer) || "—"}
          </p>
          <p className="text-[9px]">Approving Officer</p>
        </div>

        <p className="mt-3 text-center text-[8px] leading-tight text-gray-700">
          THE HOLDER OF THIS CARD IS A PERSON WITH DISABILITY AND IS ENTITLED TO
          DISCOUNTS ON MEDICAL &amp; DENTAL SERVICES, PURCHASE OF MEDICINES, BASIC
          COMMODITIES, TRANSPORTATION, ADMISSION FEES, IN ALL ESTABLISHMENTS AND
          EDUCATIONAL ASSISTANCE AS AUTHORIZED BY R.A. 9442 AND ITS IMPLEMENTING
          RULES AND REGULATIONS. ANY VIOLATION IS PUNISHABLE BY LAW.
        </p>
        <p className="mt-2 text-center text-[9px] font-semibold">
          THIS CARD IS NON TRANSFERABLE
          <br />
          VALID FOR 5 YEARS
        </p>
      </div>
    </div>
  );
}
