export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
      <div className="gov-card flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--gov-accent)]" />
        Loading portal...
      </div>
    </div>
  );
}
