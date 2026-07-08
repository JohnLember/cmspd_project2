// Generic multi-select toggle-pill group for targeting an announcement.
// `value` is an array of selected keys, or null/empty which means "all"
// (the `allLabel` pill). `options` is [{ key, label }].
export default function TargetToggle({ allLabel, options, value, onChange }) {
  const selected = Array.isArray(value) ? value : [];
  const isAll = selected.length === 0;

  const pill = (active) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "border-[color:var(--gov-primary)] bg-[color:var(--gov-primary)] text-[color:var(--gov-on-primary)]"
        : "border-[color:var(--gov-border)] text-[color:var(--gov-muted)] hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
    }`;

  const toggle = (key) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next.length ? next : null); // empty selection = all
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={isAll}
        className={pill(isAll)}
      >
        {allLabel}
      </button>
      {options.map((o) => (
        <button
          type="button"
          key={o.key}
          onClick={() => toggle(o.key)}
          aria-pressed={selected.includes(o.key)}
          className={pill(!isAll && selected.includes(o.key))}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
