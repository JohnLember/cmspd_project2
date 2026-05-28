import { NavLink } from "react-router";
import { navigationItems } from "../../constants/navigation.js";

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-6 lg:flex">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
            PDAO Central
          </p>
          <h2 className="text-xl font-semibold text-[color:var(--gov-text)]">
            PWD Monitoring
          </h2>
        </div>
        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[color:var(--gov-primary)] text-white"
                    : "text-[color:var(--gov-text)] hover:bg-[color:var(--gov-card)]"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
