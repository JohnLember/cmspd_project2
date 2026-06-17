import { supabase } from "./client.js";

const buildFullName = (formData) =>
  [formData.firstName, formData.middleName, formData.lastName, formData.suffix]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(" ");

const buildAddress = (formData) =>
  [formData.street, formData.barangay, formData.municipality, formData.province]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");

// Friendly reference the applicant keeps, e.g. CMSPD-2026-A1B2C3D4.
const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `CMSPD-${year}-${suffix}`;
};

export async function submitApplication(formData) {
  const applicationNumber = generateApplicationNumber();
  const payload = {
    application_number: applicationNumber,
    applicant_name: buildFullName(formData) || null,
    email: formData.emailAddress || null,
    contact_number: formData.contactNumber || null,
    address: buildAddress(formData) || null,
    barangay: formData.barangay || null,
    municipality: formData.municipality || null,
    province: formData.province || null,
    postal_code: formData.postal || null,
    subsidy_type: formData.appType || null,
    // Preserve the complete form so nothing entered is lost; mapped columns
    // above are for querying/reporting.
    data: formData,
  };

  // Do not chain .select() here: anonymous submitters have no SELECT policy on
  // the applications table, so reading the row back would fail even though the
  // insert succeeded. We generate the reference client-side instead.
  const { error } = await supabase.from("applications").insert(payload);

  return { applicationNumber: error ? null : applicationNumber, error };
}
