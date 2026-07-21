// Philippine Standard Geographic Code (PSGC) API lookups.
const PSGC_API_URL =
  import.meta.env.VITE_PSGC_API_URL || "https://psgc.gitlab.io/api";

// The system serves the whole province of Agusan del Sur.
export const AGUSAN_PROVINCE_CODE = "160300000";

// PSGC does not carry postal codes, so map municipality code -> ZIP.
// Keyed by code (stable) rather than name so "City of Bayugan" vs "Bayugan"
// can't drift. Source: PHLPost / FilipiKnow Agusan del Sur ZIP list.
// ponytail: hardcoded map — the 14 LGUs are fixed; only edit if PHLPost changes a ZIP.
const MUNICIPALITY_POSTAL = {
  "160301000": "8502", // Bayugan City
  "160302000": "8506", // Bunawan
  "160303000": "8513", // Esperanza
  "160304000": "8508", // La Paz
  "160305000": "8507", // Loreto
  "160306000": "8500", // Prosperidad (capital)
  "160307000": "8504", // Rosario
  "160308000": "8501", // San Francisco
  "160309000": "8511", // San Luis
  "160310000": "8512", // Santa Josefa
  "160311000": "8510", // Talacogon
  "160312000": "8505", // Trento
  "160313000": "8509", // Veruela
  "160314000": "8503", // Sibagat
};

// Cities/municipalities of Agusan del Sur, sorted by name, each with its ZIP.
export async function getAgusanMunicipalities() {
  const response = await fetch(
    `${PSGC_API_URL}/provinces/${AGUSAN_PROVINCE_CODE}/cities-municipalities/`
  );
  if (!response.ok) {
    throw new Error("Unable to load municipalities. Please try again.");
  }
  const data = await response.json();
  return data
    .map((m) => ({
      code: m.code,
      name: m.name,
      postal: MUNICIPALITY_POSTAL[m.code] || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Barangay names of a city/municipality, sorted. Works for both cities and
// municipalities (the /cities-municipalities/ path covers both).
export async function getBarangays(municipalityCode) {
  const response = await fetch(
    `${PSGC_API_URL}/cities-municipalities/${municipalityCode}/barangays/`
  );
  if (!response.ok) {
    throw new Error("Unable to load barangays. Please try again.");
  }
  const data = await response.json();
  return data.map((b) => b.name).sort((a, b) => a.localeCompare(b));
}

// The system serves Loreto, Agusan del Sur only. (Still used by announcement
// barangay targeting in Notifications.)
export const LORETO_MUNICIPALITY_CODE = "160305000";

// Returns the barangay names of Loreto, Agusan del Sur, sorted alphabetically.
export async function getLoretoBarangays() {
  return getBarangays(LORETO_MUNICIPALITY_CODE);
}
