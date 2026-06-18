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

// Turns a profile's stored disabilityTypes array into a readable string.
export function disabilityLabel(types) {
  if (!Array.isArray(types) || types.length === 0) return "—";
  return types.map((t) => DISABILITY_LABELS[t] || t).join(", ");
}
