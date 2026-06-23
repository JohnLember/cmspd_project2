import { Accessibility, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import pdaoLogo from "../../assets/pdao_logo.png";

const roles = ["PDAO Staff", "Guardian", "PWD Beneficiary"];

export default function LoginHeader() {
  return (
    <section className="flex flex-col gap-7 rounded-[var(--radius-xl)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-6 lg:p-9">
      <Link
        to="/"
        className="flex items-center gap-4 rounded-[var(--radius-md)]"
      >
        <img
          src={pdaoLogo}
          alt="PDAO seal"
          className="h-16 w-16 shrink-0 rounded-[var(--radius-md)] object-contain"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-medium text-[color:var(--gov-muted)]">
            Municipality of Loreto · Agusan del Sur
          </p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-[color:var(--gov-text)]">
            Community Monitoring System for Persons with Disabilities
          </h1>
        </div>
      </Link>

      <p className="max-w-prose text-[color:var(--gov-muted)]">
        A secure, accessible platform for monitoring, managing, and supporting
        Persons with Disabilities across the community.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-[color:var(--gov-card)] p-4">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gov-primary)]"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-[color:var(--gov-text)]">
              Protected citizen records
            </p>
            <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
              Information stays private and visible only to authorized personnel.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-[color:var(--gov-card)] p-4">
          <Accessibility
            className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gov-primary)]"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-[color:var(--gov-text)]">
              Designed for easy access
            </p>
            <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
              Clear text, strong contrast, and simple navigation for everyone.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[color:var(--gov-border)] pt-6">
        <span className="text-sm font-medium text-[color:var(--gov-muted)]">
          For:
        </span>
        {roles.map((role) => (
          <span
            key={role}
            className="rounded-full bg-[color:var(--gov-primary-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--gov-primary)]"
          >
            {role}
          </span>
        ))}
      </div>
    </section>
  );
}
