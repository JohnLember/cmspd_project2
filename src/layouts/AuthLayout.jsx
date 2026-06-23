import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </div>
    </div>
  );
}
