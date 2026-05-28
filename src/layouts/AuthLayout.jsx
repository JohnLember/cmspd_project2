import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] px-6 py-10 text-[color:var(--gov-text)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header>
          <p className="text-sm font-semibold text-[color:var(--gov-accent)]">
            PDAO Community Monitoring Portal
          </p>
          <h1 className="text-3xl font-semibold">Secure access for PWD services</h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--gov-muted)]">
            Sign in to manage assistance programs, monitor PWD services, and
            access your personalized dashboard.
          </p>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
