export const SUBSIDY_TYPES = [
  { value: "financial", label: "Financial Assistance" },
  { value: "medical", label: "Medical Assistance" },
  { value: "educational", label: "Educational Assistance" },
  { value: "food", label: "Food / Relief Pack" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

export const SUBSIDY_STATUSES = ["scheduled", "released", "cancelled"];

const typeMap = Object.fromEntries(SUBSIDY_TYPES.map((t) => [t.value, t.label]));

export const subsidyTypeLabel = (value) => typeMap[value] || value || "—";

export const formatPeso = (amount) =>
  amount == null || amount === ""
    ? "—"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(Number(amount));
