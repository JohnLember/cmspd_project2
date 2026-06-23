import { Link } from "react-router";
import pdaoLogo from "../../assets/pdao_logo.png";

const sections = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How to apply", href: "#apply" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
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
          </div>
          <p className="max-w-sm text-sm text-[color:var(--gov-muted)]">
            A secure, inclusive platform that strengthens PWD services across the
            Municipality of Loreto, with clear records, transparent reporting, and
            coordinated support.
          </p>
        </div>

        <nav aria-label="Footer">
          <h4 className="text-sm font-semibold text-[color:var(--gov-text)]">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {sections.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded text-[color:var(--gov-muted)] transition-colors hover:text-[color:var(--gov-primary)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4 className="text-sm font-semibold text-[color:var(--gov-text)]">
            Get started
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link
                to="/beneficiary-apply"
                className="rounded text-[color:var(--gov-muted)] transition-colors hover:text-[color:var(--gov-primary)]"
              >
                Apply as a beneficiary
              </Link>
            </li>
            <li>
              <Link
                to="/auth/login"
                className="rounded text-[color:var(--gov-muted)] transition-colors hover:text-[color:var(--gov-primary)]"
              >
                Sign in to the portal
              </Link>
            </li>
            <li className="text-[color:var(--gov-muted)]">pdao@loreto.gov.ph</li>
            <li className="text-[color:var(--gov-muted)]">
              Mon – Fri, 8:00 AM – 5:00 PM
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--gov-border)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-[color:var(--gov-muted)] sm:px-6">
          © {new Date().getFullYear()} Municipality of Loreto, Agusan del Sur. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
