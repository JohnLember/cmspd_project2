import { Link } from "react-router";
import pdaoLogo from "../../assets/pdao_logo.png";

const navItems = [
  { label: "Challenges", href: "#problem" },
  { label: "About", href: "#about" },
  { label: "Social Proof", href: "#social-proof" },
  { label: "Stats", href: "#stats" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-1 shadow-sm">
            <img
              src={pdaoLogo}
              alt="PDAO seal"
              className="h-full w-full rounded-xl object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Provincial Government Portal
            </p>
            <h1 className="text-lg font-semibold">
              PDAO Community Monitoring System
            </h1>
          </div>
        </div>
        <nav className="hidden items-center rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)] shadow-sm lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-2 py-1 transition hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/auth/login"
            className="rounded-full border border-[color:var(--gov-border)] px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5"
          >
            Sign in
          </Link>
          <Link
            to="/app"
            className="rounded-full bg-[color:var(--gov-primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
