import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import loretoSeal from "../../assets/loreto_seal.jpg";

// A single leaf nav link (used at top level and inside groups).
function NavItem({ item, onNavigate, nested }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `gov-nav-link${isActive ? " is-active" : ""}${nested ? " pl-9" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className="h-[1.15rem] w-[1.15rem] shrink-0"
            aria-hidden="true"
            strokeWidth={isActive ? 2.4 : 2}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

// A collapsible group whose children are nav links. Stays open whenever one of
// its children is the active route.
function NavGroup({ item, onNavigate }) {
  const location = useLocation();
  const childActive = item.children.some(
    (c) =>
      location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)
  );
  const [open, setOpen] = useState(childActive);
  const expanded = open || childActive;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        className={`gov-nav-link${childActive ? " is-active" : ""}`}
      >
        <item.icon
          className="h-[1.15rem] w-[1.15rem] shrink-0"
          aria-hidden="true"
          strokeWidth={childActive ? 2.4 : 2}
        />
        <span className="truncate">{item.label}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {expanded
        ? item.children.map((child) => (
            <NavItem
              key={child.to}
              item={child}
              onNavigate={onNavigate}
              nested
            />
          ))
        : null}
    </div>
  );
}

// Shared interior for both the desktop sidebar and the mobile drawer.
// One brand mark + nav + logout, configured per portal.
export default function SidebarContent({
  brandTitle,
  brandSubtitle,
  portalLabel,
  nav,
  onNavigate,
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Confirm logout</p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            Are you sure you want to log out of the {portalLabel}?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="btn btn-secondary h-9 px-3 text-xs"
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
              className="btn btn-primary h-9 px-3 text-xs"
            >
              Log out
            </button>
          </div>
        </div>
      ),
      {
        toastId: "logout-confirm",
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: "gov-card",
      }
    );
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 px-1">
        <img
          src={loretoSeal}
          alt=""
          aria-hidden="true"
          className="h-11 w-11 shrink-0 rounded-full object-contain ring-1 ring-[color:var(--gov-border)]"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-[color:var(--gov-text)]">
            {brandTitle}
          </p>
          <p className="truncate text-xs leading-tight text-[color:var(--gov-muted)]">
            {brandSubtitle}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Primary">
        {nav.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} onNavigate={onNavigate} />
          ) : (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          )
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--gov-border)] pt-4">
        {user?.email ? (
          <div className="flex items-center gap-3 px-1">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                aria-hidden="true"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--gov-primary-soft)] text-xs font-semibold text-[color:var(--gov-primary)]"
                aria-hidden="true"
              >
                {(user.fullName || user.email).slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[color:var(--gov-text)]">
                {user.fullName || "Signed in"}
              </p>
              <p className="truncate text-xs text-[color:var(--gov-muted)]">
                {user.email}
              </p>
            </div>
          </div>
        ) : null}
        <button type="button" onClick={handleLogout} className="btn btn-secondary w-full">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
}
