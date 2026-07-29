"use client";

import { useEffect, useRef, useState } from "react";

const POLL_MS = 8000;
const BREAK_AFTER_MS = 5 * 60 * 1000;
const BUBBLE_MS = 3200;

type Phase = "building" | "engineer_call" | "worker_ack" | "break" | "returning" | "thanks";

interface Bubble {
  who: "engineer" | "worker";
  text: string;
  key: number;
}

export function DownloadLiveScene({ initialDownloads }: { initialDownloads: number }) {
  const [phase, setPhase] = useState<Phase>("building");
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const lastCountRef = useRef(initialDownloads);
  const lastActivityRef = useRef(Date.now());
  const pendingRef = useRef(0);
  const bubbleKeyRef = useRef(0);
  const breakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showBubble(who: Bubble["who"], text: string, holdMs = BUBBLE_MS) {
    bubbleKeyRef.current += 1;
    setBubble({ who, text, key: bubbleKeyRef.current });
    window.setTimeout(() => {
      setBubble((b) => (b?.key === bubbleKeyRef.current ? null : b));
    }, holdMs);
  }

  function armBreakTimer() {
    if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
    breakTimerRef.current = setTimeout(() => {
      setPhase("break");
      showBubble("engineer", "5 min break", 4000);
    }, BREAK_AFTER_MS);
  }

  useEffect(() => {
    armBreakTimer();
    return () => {
      if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/district-rate/live-stats", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;

        const diff = data.downloads - lastCountRef.current;
        if (diff > 0) {
          lastCountRef.current = data.downloads;
          lastActivityRef.current = Date.now();
          pendingRef.current += diff;

          if (phase === "break") {
            setPhase("returning");
            showBubble("engineer", `+${pendingRef.current}`, 2600);
            window.setTimeout(() => {
              showBubble("worker", "❤️", 2200);
              setPhase("thanks");
            }, 1500);
            window.setTimeout(() => {
              showBubble("engineer", "Thanks", 2400);
            }, 3200);
            window.setTimeout(() => {
              pendingRef.current = 0;
              setPhase("building");
              armBreakTimer();
            }, 5800);
          } else {
            setPhase("engineer_call");
            showBubble("engineer", `+${diff}`, 2200);
            window.setTimeout(() => setPhase("worker_ack"), 300);
            window.setTimeout(() => setPhase("building"), 2200);
            armBreakTimer();
          }
        }
      } catch {
        // silent — animation is decorative, never block the page on this
      }
    }

    const id = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const engineerOff = phase === "break";
  const workerResting = phase === "break";

  return (
    <div className="relative flex items-end gap-4 h-16 select-none" aria-hidden="true">
      <div className="relative flex flex-col items-center">
        {bubble?.who === "worker" && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-navy-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap animate-in fade-in zoom-in duration-200">
            {bubble.text}
          </div>
        )}
        <span
          className={`text-2xl transition-transform duration-500 ${
            workerResting ? "scale-90 opacity-70" : phase === "worker_ack" ? "-translate-y-1 scale-110" : ""
          }`}
          style={workerResting ? undefined : { animation: "erg-worker-bob 1.6s ease-in-out infinite" }}
        >
          {workerResting ? "🧎" : "👷🔨"}
        </span>
      </div>

      <div
        className="relative flex flex-col items-center transition-all duration-700"
        style={{
          transform: engineerOff ? "translateX(40px)" : "translateX(0)",
          opacity: engineerOff ? 0 : 1,
        }}
      >
        {bubble?.who === "engineer" && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-navy-950 text-xs font-bold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap animate-in fade-in zoom-in duration-200">
            {bubble.text}
          </div>
        )}
        <span
          className={`text-2xl transition-transform duration-300 ${phase === "engineer_call" ? "scale-110" : ""}`}
          style={!engineerOff ? { animation: "erg-eng-bob 2.2s ease-in-out infinite" } : undefined}
        >
          👷‍♂️
        </span>
      </div>

      <style>{`
        @keyframes erg-worker-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-4deg); }
        }
        @keyframes erg-eng-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}