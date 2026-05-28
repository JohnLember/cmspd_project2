export default function LandingFooter() {
  return (
    <footer className="border-t border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 text-sm text-[color:var(--gov-muted)] lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <h3 className="text-base font-semibold text-[color:var(--gov-text)]">
            PDAO Community Monitoring System
          </h3>
          <p className="mt-3">
            A secure and inclusive platform built to strengthen PWD services
            across every barangay, with clear records, transparent reporting,
            and coordinated support.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-text)]">
            Quick links
          </h4>
          <ul className="mt-3 space-y-2">
            <li>Accessibility policy</li>
            <li>Data privacy notice</li>
            <li>Partner barangay directory</li>
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
          </ul>
        </div>
      </div>
    </footer>
  );
}
