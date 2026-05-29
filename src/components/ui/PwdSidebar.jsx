import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { pwdNavigationItems } from "../../constants/pwdNavigation.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function PwdSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Confirm logout</p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            Are you sure you want to log out of the PWD portal?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
                closeToast();
              }}
              className="rounded-full bg-[color:var(--gov-primary)] px-3 py-1 text-xs font-semibold text-white"
            >
              Log out
            </button>
          </div>
        </div>
      ),
      {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: "gov-card rounded-2xl border border-[color:var(--gov-border)]",
      }
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-6 lg:flex">
      <div className="flex h-full flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
            PWD Beneficiary
          </p>
          <h2 className="text-xl font-semibold text-[color:var(--gov-text)]">
            My Services
          </h2>
        </div>
        <nav className="flex flex-col gap-2">
          {pwdNavigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
        <div className="mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--gov-border)] px-4 py-3 text-sm font-semibold text-[color:var(--gov-text)] transition hover:bg-[color:var(--gov-card)]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
