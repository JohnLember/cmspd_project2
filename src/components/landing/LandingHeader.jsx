import { Link } from "react-router";
import pdaoLogo from "../../assets/pdao_logo.png";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How to apply", href: "#apply" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3 rounded-[var(--radius-md)]">
          <img
            src={pdaoLogo}
            alt="PDAO seal"
            className="h-11 w-11 shrink-0 rounded-[var(--radius-md)] object-contain"
            loading="lazy"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[color:var(--gov-text)]">
              PDAO Loreto
            </p>
            <p className="text-xs text-[color:var(--gov-muted)]">
              Community Monitoring System
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--gov-muted)] transition-colors hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/auth/login" className="btn btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link to="/beneficiary-apply" className="btn btn-primary">
            Apply
          </Link>
        </div>
      </div>
    </header>
  );
}
