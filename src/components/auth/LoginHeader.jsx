import { Accessibility, ShieldCheck, Sparkles } from "lucide-react";
import pdaoLogo from "../../assets/pdao_logo.png";

const roles = ["PDAO Staff", "Guardian", "PWD Beneficiary"];

export default function LoginHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-6 shadow-sm lg:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(29,78,216,0.18),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.18),_transparent_70%)]" />
      </div>
      <div className="relative space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-2">
            <img
              src={pdaoLogo}
              alt="PDAO seal"
              className="h-full w-full rounded-xl object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Municipality of Loreto, Agusan del Sur
            </p>
            <h1 className="text-2xl font-semibold">
              Web-Based Community Monitoring System for Persons with
              Disabilities
            </h1>
          </div>
        </div>
        <p className="text-sm text-[color:var(--gov-muted)]">
          A secure and accessible platform for monitoring, managing, and
          supporting Persons with Disabilities in the community.
        </p>
        <div className="grid gap-3 text-sm text-[color:var(--gov-muted)] sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] px-4 py-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-[color:var(--gov-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[color:var(--gov-text)]">
                Government-grade security
              </p>
              <p className="text-xs">
                Access logging, role-based controls, and secure data handling.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] px-4 py-3">
            <Accessibility className="mt-0.5 h-5 w-5 text-[color:var(--gov-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[color:var(--gov-text)]">
                Accessibility-first design
              </p>
              <p className="text-xs">
                WCAG-inspired layouts, clear typography, and high contrast.
              </p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]">
            Supported roles
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--gov-text)]"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[color:var(--gov-muted)]">
          <Sparkles className="h-4 w-4 text-[color:var(--gov-accent)]" />
          Secure access for verified government accounts only.
        </div>
      </div>
    </section>
  );
}
