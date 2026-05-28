"use client";

import { useEffect, useRef, useState } from "react";
import { ESCAPE_TIME_MS, useGame } from "@/lib/game-state";

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function colorFor(frac: number) {
  if (frac > 0.75) return "#34c2ff"; // blue
  if (frac > 0.5) return "#aaff5a"; // green
  if (frac > 0.25) return "#ffe600"; // yellow
  return "#ff2b2b"; // red
}

export default function EscapeTimer() {
  const { state, forceEnd } = useGame();
  const start = state.escapeStartedAt;
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(false);

  useEffect(() => {
    if (start == null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [start]);

  const remaining =
    start == null ? ESCAPE_TIME_MS : Math.max(0, start + ESCAPE_TIME_MS - now);

  useEffect(() => {
    if (start != null && remaining <= 0 && !fired.current) {
      fired.current = true;
      forceEnd("gameover");
    }
  }, [start, remaining, forceEnd]);

  if (start == null) return null;

  const color = colorFor(remaining / ESCAPE_TIME_MS);

  return (
    <div className="px-3 py-2 border-b-2 border-white">
      <div className="flex items-center justify-between mb-1">
        <span className="ut-label">TIME LEFT</span>
        <span className="ut-pixel-text text-ut-dim">{"⏱"}</span>
      </div>
      <p
        className="font-pixel text-2xl text-center"
        style={{ color, textShadow: "0 0 8px currentColor" }}
      >
        {format(remaining)}
      </p>
    </div>
  );
}
