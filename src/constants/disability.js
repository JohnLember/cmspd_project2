export const DISABILITY_LABELS = {
  deaf: "Deaf or Hard of Hearing",
  intellectual: "Intellectual Disability",
  learning: "Learning Disability",
  mental: "Mental Disability",
  physical: "Physical Disability (Orthopedic)",
  psychosocial: "Psychosocial Disability",
  speech: "Speech and Language Impairment",
  visual: "Visual Disability",
  cancer: "Cancer (RA11215)",
  rare: "Rare Disease (RA10747)",
  other: "Other",
};

// Ready-made { key, label } options for a TargetToggle / picker.
export const DISABILITY_OPTIONS = Object.entries(DISABILITY_LABELS).map(
  ([key, label]) => ({ key, label })
);

// Distinct chart colours per disability type (used by stacked bar charts).
export const DISABILITY_COLORS = {
  deaf: "#2563eb",
  intellectual: "#7c3aed",
  learning: "#db2777",
  mental: "#dc2626",
  physical: "#ea580c",
  psychosocial: "#d97706",
  speech: "#0d9488",
  visual: "#16a34a",
  cancer: "#0891b2",
  rare: "#4f46e5",
  other: "#64748b",
  unspecified: "#94a3b8",
};

// Turns a profile's stored disabilityTypes array into a readable string.
export function disabilityLabel(types) {
  if (!Array.isArray(types) || types.length === 0) return "—";
  return types.map((t) => DISABILITY_LABELS[t] || t).join(", ");
}

// Readable label for an announcement's target disability types. Returns null
// when it targets everyone (empty/null), so callers can hide the "For:" badge.
export function targetLabel(types) {
  if (!Array.isArray(types) || types.length === 0) return null;
  return types.map((t) => DISABILITY_LABELS[t] || t).join(", ");
}
