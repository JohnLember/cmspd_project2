// Rules for when a PWD's Digital ID may be viewed: every required field must be
// filled in. Blood type is intentionally excluded (optional).

const hasName = (profile) => {
  const d = profile.data ?? {};
  return Boolean((d.lastName && d.firstName) || profile.full_name);
};

// `fixable` marks fields the PWD can edit on their own profile page; the rest
// come from their approved application and need PDAO assistance to change.
const REQUIRED_ID_FIELDS = [
  { label: "Profile photo", filled: (p) => Boolean(p.avatar_url), fixable: true },
  { label: "Full name", filled: hasName, fixable: true },
  { label: "Barangay", filled: (p) => Boolean(p.barangay), fixable: true },
  { label: "Address", filled: (p) => Boolean(p.address), fixable: true },
  { label: "Date of birth", filled: (p) => Boolean(p.birthdate), fixable: true },
  { label: "Sex", filled: (p) => Boolean(p.sex), fixable: true },
  {
    label: "Type of disability",
    filled: (p) =>
      Array.isArray(p.data?.disabilityTypes) && p.data.disabilityTypes.length > 0,
    fixable: false,
  },
  {
    label: "Emergency contact person",
    filled: (p) => Boolean(p.data?.contactPerson),
    fixable: false,
  },
  {
    label: "Emergency contact number",
    filled: (p) => Boolean(p.data?.telNos),
    fixable: false,
  },
];

// Returns the list of unfilled required fields ({ label, fixable }). When the
// array is empty, the Digital ID is complete and may be shown.
export function getMissingIdFields(profile) {
  if (!profile) {
    return REQUIRED_ID_FIELDS.map(({ label, fixable }) => ({ label, fixable }));
  }
  return REQUIRED_ID_FIELDS.filter((f) => !f.filled(profile)).map(
    ({ label, fixable }) => ({ label, fixable })
  );
}
