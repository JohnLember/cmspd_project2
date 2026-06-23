export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--gov-bg)] px-6">
      <div
        className="flex flex-col items-center gap-4 text-center"
        role="status"
        aria-live="polite"
      >
        <span
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-[color:var(--gov-border)] border-t-[color:var(--gov-primary)] motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-[color:var(--gov-muted)]">
          Loading portal…
        </p>
      </div>
    </div>
  );
}
