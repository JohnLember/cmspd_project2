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

// PDAO staff: list every application, newest first. RLS restricts this to the
// pdao role (see migration fix_applications_rls_pdao_role).
export async function getApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  return { applications: data ?? [], error };
}

// PDAO staff: save which office requirements the applicant has presented so far.
// `requirements` is a map like { "Valid government-issued ID": true, ... }.
// Leaves status untouched (used when the checklist is incomplete → stay pending).
export async function saveRequirements(id, requirements) {
  const { error } = await supabase
    .from("applications")
    .update({ requirements })
    .eq("id", id);

  return { error };
}

// PDAO staff: change an application's review status.
export async function updateApplicationStatus(id, status) {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  return { error };
}

// PDAO staff: approve an application. Runs the approve-application edge function,
// which creates the PWD auth account (email from the applicant name, password
// from last name + year), links it to the application, stores the approval
// record (signature + officers), and sets status=approved.
// `approval` = { signature, processingOfficer, approvingOfficer }.
// Returns { result: { email, password, pwdUserId }, error }.
export async function approveApplication(applicationId, approval = {}) {
  const { data, error } = await supabase.functions.invoke("approve-application", {
    body: { applicationId, ...approval },
  });

  if (error) {
    // Non-2xx responses surface as FunctionsHttpError; the JSON body (with our
    // `error` message) lives on error.context, not in `data`.
    let message = error.message;
    try {
      const body = await error.context?.json?.();
      if (body?.error) message = body.error;
    } catch {
      // keep the generic message
    }
    return { result: null, error: { message } };
  }

  return { result: data, error: null };
}
