// The system now covers the whole province of Agusan del Sur, so locality is
// (municipality, barangay) — barangay names repeat across municipalities.
// A PWD profile keeps its municipality inside the copied application form data
// (there is no municipality column on profiles); applications have a column.
export const UNSPECIFIED = "Unspecified";
export const FIXED_PROVINCE = "Agusan del Sur";

export const profileMunicipality = (p) =>
  (p?.data?.municipality || "").trim() || UNSPECIFIED;

export const profileBarangay = (p) => (p?.barangay || "").trim() || UNSPECIFIED;
