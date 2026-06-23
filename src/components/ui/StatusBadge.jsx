// Maps a record status to a semantic badge. Used across applications, PWD
// management, reports, and dashboards so status reads the same everywhere.
const STATUS_VARIANT = {
  approved: "success",
  verified: "success",
  active: "success",
  pending: "warning",
  "in-review": "warning",
  unverified: "neutral",
  rejected: "danger",
  declined: "danger",
};

const STATUS_DOT = {
  success: "var(--gov-success)",
  warning: "var(--gov-warning)",
  danger: "var(--gov-danger)",
  info: "var(--gov-info)",
  neutral: "var(--gov-muted)",
};

export default function StatusBadge({ status, label, dot = true }) {
  const key = String(status || "pending").toLowerCase();
  const variant = STATUS_VARIANT[key] ?? "neutral";
  return (
    <span className={`gov-badge gov-badge--${variant} capitalize`}>
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: STATUS_DOT[variant] }}
          aria-hidden="true"
        />
      ) : null}
      {label || key}
    </span>
  );
}
