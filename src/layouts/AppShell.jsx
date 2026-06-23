import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import SidebarContent from "../components/ui/SidebarContent.jsx";

// Unified app shell for the PDAO, PWD, and Guardian portals.
// Desktop: sticky sidebar. Mobile/tablet: accessible slide-in drawer.
export default function AppShell({
  brandTitle,
  brandSubtitle,
  portalLabel,
  nav,
  headerTitle,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);

  // While the drawer is open: lock scroll, move focus in, close on Escape, and
  // restore focus to the trigger on close. (Link clicks close it via onNavigate.)
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstLink = drawerRef.current?.querySelector("a, button");
    firstLink?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [drawerOpen]);

  const sidebarProps = {
    brandTitle,
    brandSubtitle,
    portalLabel,
    nav,
  };

  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-5 lg:flex">
          <SidebarContent {...sidebarProps} />
        </aside>

        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[color:var(--gov-border)] bg-[color:var(--gov-surface)]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--gov-surface)]/80 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="btn btn-ghost -ml-2 h-11 w-11 px-0 lg:hidden"
                  aria-label="Open navigation menu"
                  aria-expanded={drawerOpen}
                  aria-controls="app-drawer"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <h1 className="truncate text-base font-semibold text-[color:var(--gov-text)] sm:text-lg">
                  {headerTitle}
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-[color:var(--gov-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--gov-muted)] md:inline-flex">
                  <span
                    className="h-2 w-2 rounded-full bg-[color:var(--gov-success)]"
                    aria-hidden="true"
                  />
                  Operational
                </span>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="lg:hidden">
          <div
            className="gov-backdrop fixed inset-0 z-[var(--z-backdrop)] backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            id="app-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="gov-drawer fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-[min(20rem,85vw)] flex-col border-r border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-5"
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn btn-ghost absolute right-3 top-3 h-10 w-10 px-0"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <SidebarContent {...sidebarProps} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}
