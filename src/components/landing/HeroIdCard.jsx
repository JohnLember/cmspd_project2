import { Accessibility } from "lucide-react";
import pdaoLogo from "../../assets/pdao_logo.png";

// The signature hero visual: a stylized sample of the Digital PWD ID this
// portal issues — the most characteristic artifact of the product. Decorative
// sample data, so it's hidden from assistive tech (the real value is the
// headline text beside it).
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Static "barcode" for the footer strip — purely decorative texture.
const BARS = [3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1];

export default function HeroIdCard() {
  const handleMove = (e) => {
    // Mouse only — don't tilt while a touch is panning/scrolling the page.
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${px * 11}deg) rotateX(${-py * 11}deg)`;
  };
  const handleLeave = (e) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <div className="idcard-float [perspective:1200px]" aria-hidden="true">
      <div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="idcard-tilt relative mx-auto w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] shadow-[var(--elev-2)]"
      >
        {/* Header band */}
        <div className="flex items-center gap-3 bg-[linear-gradient(135deg,var(--gov-primary),var(--gov-accent))] px-5 py-4 text-[color:var(--gov-on-primary)]">
          <img
            src={pdaoLogo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full bg-white/90 object-contain p-1"
          />
          <div className="leading-tight">
            <p className="text-[11px] font-medium opacity-90">
              Republic of the Philippines
            </p>
            <p className="text-sm font-semibold">Persons with Disability ID</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex gap-4 px-5 py-5">
          <div className="grid h-24 w-20 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]">
            <Accessibility className="h-11 w-11" strokeWidth={1.75} />
          </div>
          <dl className="min-w-0 flex-1 space-y-2.5">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--gov-faint)]">
                Name
              </dt>
              <dd className="text-base font-semibold text-[color:var(--gov-text)]">
                Juan D. Cruz
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--gov-faint)]">
                ID Number
              </dt>
              <dd className="tnum font-mono text-sm text-[color:var(--gov-text)]">
                CMSPD-2026-A1B2C3D4
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--gov-faint)]">
                Type of disability
              </dt>
              <dd className="text-sm text-[color:var(--gov-text)]">
                Visual Disability
              </dd>
            </div>
          </dl>
        </div>

        {/* Footer strip */}
        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--gov-border)] bg-[color:var(--gov-card)] px-5 py-3">
          <span className="gov-badge gov-badge--success">Valid nationwide</span>
          <div className="flex items-end gap-[3px]" aria-hidden="true">
            {BARS.map((w, i) => (
              <span
                key={i}
                className="block h-6 rounded-[1px] bg-[color:var(--gov-text)]"
                style={{ width: `${w}px`, opacity: 0.55 }}
              />
            ))}
          </div>
        </div>

        <span className="idcard-shine" />
      </div>
    </div>
  );
}
