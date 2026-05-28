import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--gov-text)] shadow-sm transition hover:-translate-y-0.5"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          Light mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Dark mode
        </>
      )}
    </button>
  );
}
