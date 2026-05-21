"use client";

import { useEffect, useState } from "react";
import Typewriter from "./Typewriter";
import { useGame } from "@/lib/game-state";

const LINES = [
  "* The plane spun. Then nothing.",
  "* You wake up on sand the color of bone.",
  "* Your smartwatch flickers. It is the last voice you have.",
  "* WATCH: To survive, you must SPEAK. I will hear you.",
  "* WATCH: Stay silent — and the island keeps you.",
];

export default function IntroScreen() {
  const { goto } = useGame();
  const [idx, setIdx] = useState(0);
  const [lineDone, setLineDone] = useState(false);

  const advance = () => {
    if (!lineDone) return;
    if (idx < LINES.length - 1) {
      setIdx((i) => i + 1);
      setLineDone(false);
    } else {
      goto("overworld");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "z" || e.key === "Z") {
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[140px] font-pixel text-ut-dust select-none">{"~"}</div>
      </div>

      <div className="relative w-full ut-box p-6 min-h-[140px] flex items-center">
        <Typewriter
          key={idx}
          text={LINES[idx]}
          className="ut-dialog"
          onDone={() => setLineDone(true)}
        />
        {lineDone && (
          <span className="absolute bottom-2 right-3 ut-pixel-text text-ut-dim animate-blink">
            ▼
          </span>
        )}
      </div>

      <p className="ut-pixel-text text-ut-dim mt-3 opacity-70">
        [Z / ENTER] CONTINUE
      </p>
    </div>
  );
}
