import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--gov-bg)] p-6 text-center">
      <div className="gov-card rounded-2xl p-8">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          The requested page is unavailable. Return to the dashboard to
          continue.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-xl bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
