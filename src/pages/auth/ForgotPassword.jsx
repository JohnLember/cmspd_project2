export default function ForgotPassword() {
  return (
    <div className="gov-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Reset your password</h2>
      <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
        Submit your email and we will send reset instructions once Supabase Auth
        is enabled.
      </p>
      <form className="mt-4 flex flex-col gap-3">
        <label className="text-sm font-medium" htmlFor="reset-email">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          className="rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
          placeholder="name@pdao.gov.ph"
        />
        <button
          type="button"
          className="rounded-xl bg-[color:var(--gov-primary)] px-4 py-3 text-sm font-semibold text-white"
        >
          Send reset link
        </button>
      </form>
    </div>
  );
}
