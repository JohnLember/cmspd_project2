import { Link } from "react-router";

const requirements = [
  "Barangay certificate or endorsement",
  "Valid government-issued ID",
  "Medical certificate or disability assessment",
  "Recent 2x2 photo",
];

export default function BeneficiaryApply() {
  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] px-6 py-10 text-[color:var(--gov-text)]">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="gov-card rounded-3xl p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]">
            PWD Beneficiary Application
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Apply to become a PWD beneficiary
          </h1>
          <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
            Submit your request for assistance. PDAO staff will review your
            application and provide updates through the portal and official
            communication channels.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/auth/login"
              className="rounded-full bg-[color:var(--gov-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Sign in to submit
            </Link>
            <Link
              to="/"
              className="rounded-full border border-[color:var(--gov-border)] px-5 py-2.5 text-sm font-semibold text-[color:var(--gov-text)] transition hover:-translate-y-0.5"
            >
              Back to landing page
            </Link>
          </div>
        </header>

        <section className="gov-card rounded-3xl p-6 lg:p-8">
          <h2 className="text-xl font-semibold">Prepare these requirements</h2>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            These documents are required for validation. Digital copies will be
            accepted once online submission is enabled.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            {requirements.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="gov-card rounded-3xl p-6 lg:p-8">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Online applications will be available once authentication is fully
            enabled. For now, please visit the PDAO office or coordinate with
            your barangay coordinator.
          </p>
        </section>
      </div>
    </div>
  );
}
