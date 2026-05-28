import { Link } from "react-router";

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "About", href: "#about" },
  { label: "Social Proof", href: "#social-proof" },
  { label: "Stats", href: "#stats" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-card)]">
            <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
              <path
                d="M24 6c7.732 0 14 6.268 14 14 0 7.732-6.268 14-14 14-7.732 0-14-6.268-14-14C10 12.268 16.268 6 24 6Zm0 4.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Z"
                fill="var(--gov-primary)"
              />
              <path
                d="M18.5 34.5h11a9.5 9.5 0 0 1-11 0Z"
                fill="var(--gov-accent)"
              />
            </svg>
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
        <nav className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-[color:var(--gov-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/auth/login"
            className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold"
          >
            Sign in
          </Link>
          <Link
            to="/app"
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-xs font-semibold text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
