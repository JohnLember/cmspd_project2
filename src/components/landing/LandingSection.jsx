export default function LandingSection({ id, title, subtitle, children }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold lg:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm text-[color:var(--gov-muted)]">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}
