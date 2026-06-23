import { useState } from "react";
import { useNavigate } from "react-router";
import { Mic, MicOff } from "lucide-react";
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
    <div className="fixed bottom-5 right-5 z-[var(--z-sticky)] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {(feedback || error) && (
        <div
          aria-live="polite"
          className="gov-raised max-w-xs px-4 py-2.5 text-xs text-[color:var(--gov-text)]"
        >
          {error ? `Mic error: ${error}` : feedback}
        </div>
      )}
      {listening ? (
        <div className="gov-raised px-3 py-2 text-[11px] leading-relaxed text-[color:var(--gov-muted)]">
          Try: “dashboard”, “digital ID”, “announcements”, “profile”, “log out”
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        aria-label={listening ? "Stop voice navigation" : "Start voice navigation"}
        aria-pressed={listening}
        title="Voice navigation"
        className={`relative grid h-14 w-14 place-items-center rounded-full text-[color:var(--gov-on-primary)] shadow-[var(--elev-2)] transition-[transform,background-color] duration-[var(--dur)] ease-[var(--ease-out)] active:scale-95 ${
          listening
            ? "bg-[color:var(--gov-danger)]"
            : "bg-[color:var(--gov-primary)] hover:bg-[color:var(--gov-primary-hover)]"
        }`}
      >
        {listening ? (
          <>
            <span
              className="absolute h-14 w-14 animate-ping rounded-full bg-[color:var(--gov-danger)] opacity-40 motion-reduce:hidden"
              aria-hidden="true"
            />
            <MicOff className="relative h-6 w-6" aria-hidden="true" />
          </>
        ) : (
          <Mic className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
