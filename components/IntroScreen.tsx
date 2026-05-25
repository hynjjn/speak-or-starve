"use client";

import { useEffect, useRef, useState } from "react";
import Typewriter, { type TypewriterHandle } from "./Typewriter";
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
  const tw = useRef<TypewriterHandle>(null);

  const handleAdvance = () => {
    if (!lineDone) {
      tw.current?.complete();
      return;
    }
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
        handleAdvance();
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

      <button
        type="button"
        onClick={handleAdvance}
        aria-label={lineDone ? "Continue" : "Skip to end of line"}
        className="relative w-full ut-box p-6 min-h-[140px] flex items-center text-left cursor-pointer hover:border-ut-act focus:outline-none focus:border-ut-act transition-colors"
      >
        <Typewriter
          ref={tw}
          key={idx}
          text={LINES[idx]}
          className="ut-dialog"
          onDone={() => setLineDone(true)}
        />
        <span
          className={[
            "absolute bottom-2 right-4 font-pixel text-4xl leading-none",
            lineDone ? "text-ut-act animate-blink" : "text-ut-dim opacity-60",
          ].join(" ")}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      <p className="ut-pixel-text text-ut-dim mt-3 opacity-70">
        [Z / ENTER / CLICK] CONTINUE · CLICK WHILE TYPING TO SKIP
      </p>
    </div>
  );
}
