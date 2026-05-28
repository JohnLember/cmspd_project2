import pdaoLogo from "../../assets/pdao_logo.png";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 text-sm text-[color:var(--gov-muted)] lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
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
              <h3 className="text-base font-semibold text-[color:var(--gov-text)]">
                PDAO Community Monitoring System
              </h3>
            </div>
          </div>
          <p>
            A secure and inclusive platform built to strengthen PWD services
            across every barangay, with clear records, transparent reporting,
            and coordinated support.
          </p>
          <div className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] px-4 py-3 text-xs text-[color:var(--gov-muted)]">
            Official digital services for persons with disabilities.
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-text)]">
            Quick links
          </h4>
          <ul className="mt-3 space-y-2">
            <li>Accessibility policy</li>
            <li>Data privacy notice</li>
            <li>Partner barangay directory</li>
            <li>Service charter</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-text)]">
            Contact
          </h4>
          <ul className="mt-3 space-y-2">
            <li>support@pdao.gov.ph</li>
            <li>(043) 123-4567</li>
            <li>Provincial Capitol Complex</li>
            <li>Monday - Friday, 8:00 AM - 5:00 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--gov-border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-4 text-xs text-[color:var(--gov-muted)]">
          <p>© 2026 Municipality of Loreto, Agusan del Sur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
