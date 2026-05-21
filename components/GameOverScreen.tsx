"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/game-state";

export default function GameOverScreen() {
  const { reset } = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "z" || e.key === "Z") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black">
      <div className="absolute inset-0 pointer-events-none animate-flash bg-ut-soul opacity-10" />

      <h1 className="font-pixel text-5xl text-ut-soul tracking-widest animate-shake">
        GAME OVER
      </h1>

      <div className="ut-box p-6 max-w-md">
        <p className="ut-dialog text-center">
          * Your soul cracks.
          <br />
          * The watch goes dark.
          <br />* The island keeps you.
        </p>
      </div>

      <button className="ut-btn animate-blink" onClick={() => reset()}>
        ▶ TRY AGAIN — PRESS [Z]
      </button>
    </div>
  );
}
