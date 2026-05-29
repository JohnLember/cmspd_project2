export default function PwdProfile() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Profile Management</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Update your personal details and contact information.
        </p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="profile-name">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="profile-email">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="profile-contact">
              Mobile number
            </label>
            <input
              id="profile-contact"
              type="tel"
              className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
              placeholder="09xx xxx xxxx"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="profile-address">
              Address
            </label>
            <input
              id="profile-address"
              type="text"
              className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
              placeholder="Barangay, Municipality"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
