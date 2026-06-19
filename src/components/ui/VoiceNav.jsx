import { useState } from "react";
import { useNavigate } from "react-router";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition.js";
import { useAuth } from "../../context/AuthContext.jsx";

// Spoken-command → destination. Order matters: more specific first so generic
// words like "home" don't shadow "digital id".
const COMMANDS = [
  { keywords: ["log out", "logout", "sign out", "signout"], action: "logout", label: "Logging out" },
  {
    keywords: ["digital id", "digital", "my id", "card", "i d"],
    to: "/app/pwd-beneficiary/digital-id",
    label: "Digital ID",
  },
  {
    keywords: ["subsidy", "subsidies", "assistance", "payout", "status"],
    to: "/app/pwd-beneficiary/subsidy-status",
    label: "Subsidy Status",
  },
  {
    keywords: ["announcement", "announcements", "news", "advisory", "advisories"],
    to: "/app/pwd-beneficiary/announcements",
    label: "Announcements",
  },
  {
    keywords: ["profile", "account", "settings"],
    to: "/app/pwd-beneficiary/profile",
    label: "Profile",
  },
  {
    keywords: ["dashboard", "home", "main", "overview"],
    to: "/app/pwd-beneficiary",
    label: "Dashboard",
  },
];

export default function VoiceNav() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSupported, listening, error, start, stop } = useSpeechRecognition({
    lang: "en-PH",
  });
  const [feedback, setFeedback] = useState("");

  if (!isSupported) return null;

  const handleResult = (text) => {
    const heard = text.toLowerCase();
    const match = COMMANDS.find((cmd) =>
      cmd.keywords.some((k) => heard.includes(k))
    );
    if (!match) {
      setFeedback(`Heard “${text}” — no matching command.`);
      return;
    }
    setFeedback(`Heard “${text}” → ${match.label}`);
    if (match.action === "logout") {
      logout();
      navigate("/", { replace: true });
    } else {
      navigate(match.to);
    }
  };

  const handleClick = () => {
    if (listening) {
      stop();
      return;
    }
    setFeedback("");
    start(handleResult);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {(feedback || error) && (
        <div
          aria-live="polite"
          className="max-w-xs rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-xs text-[color:var(--gov-text)] shadow-lg"
        >
          {error ? `Mic error: ${error}` : feedback}
        </div>
      )}
      {listening ? (
        <div className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-1 text-[10px] text-[color:var(--gov-muted)] shadow">
          Try: “dashboard”, “digital ID”, “subsidy”, “announcements”, “profile”,
          “log out”
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        aria-label={listening ? "Stop voice navigation" : "Start voice navigation"}
        title="Voice navigation"
        className={`grid h-14 w-14 place-items-center rounded-full text-xl text-white shadow-lg transition ${
          listening ? "animate-pulse bg-red-600" : "bg-[color:var(--gov-primary)]"
        }`}
      >
        🎤
      </button>
    </div>
  );
}
