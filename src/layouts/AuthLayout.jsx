import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] px-6 py-10 text-[color:var(--gov-text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Outlet />
      </div>
    </div>
  );
}
