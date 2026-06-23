export default function LandingSection({ id, title, subtitle, children }) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-6xl scroll-mt-24 space-y-8"
    >
      <div className="max-w-2xl space-y-3">
        <h2 className="text-2xl font-semibold text-[color:var(--gov-text)] sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-[color:var(--gov-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
