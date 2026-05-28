"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Typewriter, { type TypewriterHandle } from "./Typewriter";
import { useGame } from "@/lib/game-state";

const LINES = [
  "* The plane fell down. And BOOM!",
  "* You wake up on the mystery island!",
  "* To survive, you must speak.",
  "* YOU HAVE ONLY 10 MINUTES TO GO HOME!",
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
      <Image
        src="/sprites/intro.jpeg"
        alt="A plane crash on a mystery island"
        fill
        sizes="960px"
        priority
        className="object-cover select-none"
      />
      <div className="absolute inset-0 bg-black/40" />

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

      <p className="relative ut-pixel-text text-ut-dim mt-3 opacity-70">
        [Z / ENTER / CLICK] CONTINUE · CLICK WHILE TYPING TO SKIP
      </p>
    </div>
  );
}
