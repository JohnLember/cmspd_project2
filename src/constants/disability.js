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

// Chart colours per disability type. These are the shared --chart-* slots from
// index.css (light + dark steps behind one name), assigned in this fixed order
// so a type keeps its colour when a filter drops other types, and so adjacent
// stacked segments stay separable for colour-blind readers. "Other" and
// "Unspecified" fold to neutral rather than taking a hue of their own.
export const DISABILITY_COLORS = {
  deaf: "var(--chart-1)",
  intellectual: "var(--chart-2)",
  learning: "var(--chart-3)",
  mental: "var(--chart-4)",
  physical: "var(--chart-5)",
  psychosocial: "var(--chart-6)",
  speech: "var(--chart-7)",
  visual: "var(--chart-8)",
  cancer: "var(--chart-9)",
  rare: "var(--chart-10)",
  other: "var(--chart-neutral)",
  unspecified: "var(--chart-neutral-faint)",
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
