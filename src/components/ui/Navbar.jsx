import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
            Provincial Government Portal
          </p>
          <h1 className="text-lg font-semibold text-[color:var(--gov-text)]">
            Community Monitoring System for PWD
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs text-[color:var(--gov-muted)] md:flex">
            <span className="h-2 w-2 rounded-full bg-[color:var(--gov-accent)]" />
            System status: Operational
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
