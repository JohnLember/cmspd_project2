import { Bell, ShieldCheck } from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle.jsx";

const notificationSettings = [
  { label: "Email alerts for applications", defaultChecked: true },
  { label: "SMS reminders for beneficiaries", defaultChecked: false },
  { label: "Weekly summary reports", defaultChecked: true },
];

const securitySettings = [
  { label: "Require two-factor confirmation", defaultChecked: false },
  { label: "Auto-logout after inactivity", defaultChecked: true },
  { label: "Log all administrative actions", defaultChecked: true },
];

function ToggleRow({ label, defaultChecked }) {
  return (
    <label className="flex items-center justify-between gap-4 py-1 text-sm text-[color:var(--gov-text)]">
      <span>{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-[1.15rem] w-[1.15rem] accent-[color:var(--gov-primary)]"
      />
    </label>
  );
}

export default function Settings() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            System preferences
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Manage appearance, notifications, and security for the PDAO portal.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="gov-card p-6">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]"
              aria-hidden="true"
            >
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-[color:var(--gov-muted)]">
                Email and SMS alerts for applications and reports.
              </p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[color:var(--gov-border)]">
            {notificationSettings.map((item) => (
              <ToggleRow key={item.label} {...item} />
            ))}
          </div>
        </div>

        <div className="gov-card p-6">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]"
              aria-hidden="true"
            >
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-[color:var(--gov-muted)]">
                Access controls and session management for PDAO staff.
              </p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[color:var(--gov-border)]">
            {securitySettings.map((item) => (
              <ToggleRow key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
