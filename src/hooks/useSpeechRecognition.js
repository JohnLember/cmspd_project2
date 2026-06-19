import { useEffect, useRef, useState } from "react";

// Thin wrapper around the browser Web Speech API (SpeechRecognition).
// Free, no backend; works in Chrome/Edge and Android. Requires HTTPS or
// localhost and a one-time microphone permission.
export function useSpeechRecognition({ lang = "en-PH" } = {}) {
  const Recognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSupported = Boolean(Recognition);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupported) return undefined;
    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text && onResultRef.current) onResultRef.current(text);
    };
    recognition.onerror = (event) => {
      setError(event.error || "Speech recognition error");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    };
  }, [isSupported, Recognition, lang]);

  const start = (onResult) => {
    if (!isSupported || listening) return;
    onResultRef.current = onResult;
    setError("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      /* start() throws if already running — ignore */
    }
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  };

  return { isSupported, listening, error, start, stop };
}
