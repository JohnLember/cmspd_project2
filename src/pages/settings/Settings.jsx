import ThemeToggle from "../../components/ui/ThemeToggle.jsx";

export default function Settings() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Settings
            </p>
            <h2 className="text-xl font-semibold">System Preferences</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Manage theme, notification preferences, and security settings.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="gov-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold">Notification Settings</h3>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Control email and SMS alerts for applications and reports.
          </p>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            <label className="flex items-center justify-between">
              <span>Email alerts for applications</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>SMS reminders for beneficiaries</span>
              <input type="checkbox" className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between">
              <span>Weekly summary reports</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
          </div>
        </div>
        <div className="gov-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold">Security</h3>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Enforce access controls and session management for PDAO staff.
          </p>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            <label className="flex items-center justify-between">
              <span>Require two-factor confirmation</span>
              <input type="checkbox" className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between">
              <span>Auto-logout after inactivity</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Log all administrative actions</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
