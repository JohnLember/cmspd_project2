import { DISABILITY_LABELS } from "../../constants/disability.js";

// Toggle group to target an announcement at specific disability types.
// `value` is an array of type keys, or null/empty which means "All Types".
export default function DisabilityTargetToggle({ value, onChange }) {
  const selected = Array.isArray(value) ? value : [];
  const isAll = selected.length === 0;

  const pill = (active) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "border-[color:var(--gov-primary)] bg-[color:var(--gov-primary)] text-[color:var(--gov-on-primary)]"
        : "border-[color:var(--gov-border)] text-[color:var(--gov-muted)] hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
    }`;

  const toggleType = (key) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next.length ? next : null); // empty selection = All Types
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={isAll}
        className={pill(isAll)}
      >
        All Types
      </button>
      {Object.entries(DISABILITY_LABELS).map(([key, label]) => (
        <button
          type="button"
          key={key}
          onClick={() => toggleType(key)}
          aria-pressed={selected.includes(key)}
          className={pill(!isAll && selected.includes(key))}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
