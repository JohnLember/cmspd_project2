// Philippine Standard Geographic Code (PSGC) API lookups.
const PSGC_API_URL =
  import.meta.env.VITE_PSGC_API_URL || "https://psgc.gitlab.io/api";

// The system serves Loreto, Agusan del Sur only.
export const LORETO_MUNICIPALITY_CODE = "160305000";

// Returns the barangay names of Loreto, Agusan del Sur, sorted alphabetically.
export async function getLoretoBarangays() {
  const response = await fetch(
    `${PSGC_API_URL}/municipalities/${LORETO_MUNICIPALITY_CODE}/barangays/`
  );
  if (!response.ok) {
    throw new Error("Unable to load barangays. Please try again.");
  }
  const data = await response.json();
  return data
    .map((barangay) => barangay.name)
    .sort((a, b) => a.localeCompare(b));
}
