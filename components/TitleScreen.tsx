"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/game-state";

export default function TitleScreen() {
  const { goto } = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        goto("intro");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goto]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-6 w-2 h-2 bg-white animate-blink" />
        <div
          className="absolute top-10 right-12 w-2 h-2 bg-white animate-blink"
          style={{ animationDelay: "0.3s" }}
        />
        <div
          className="absolute bottom-16 left-16 w-2 h-2 bg-white animate-blink"
          style={{ animationDelay: "0.7s" }}
        />
      </div>

      <h1 className="font-pixel text-white text-3xl sm:text-4xl tracking-[0.18em] drop-shadow-[2px_2px_0_#444]">
        SPEAK
        <span className="block my-3 text-base text-ut-dim">— OR —</span>
        <span className="text-ut-soul">STARVE</span>
      </h1>

      <div className="my-8 flex items-center justify-center">
        <div className="soul soul-lg animate-bob" aria-hidden />
      </div>

      <p className="ut-pixel-text text-ut-dim max-w-md leading-loose">
        AN UNDERTALE-STYLE SURVIVAL SPEAKING GAME.
        <br />
        SPEAK, OR THE ISLAND KEEPS YOU.
      </p>

      <button
        onClick={() => goto("intro")}
        className="ut-btn mt-10 animate-blink"
      >
        ▶ PRESS ENTER TO BEGIN
      </button>

      <p className="absolute bottom-4 right-4 ut-pixel-text text-ut-dim opacity-60">
        v0.1 · NEXT.JS
      </p>
    </div>
  );
}
