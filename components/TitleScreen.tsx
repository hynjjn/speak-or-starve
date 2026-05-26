"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/game-state";
import { CHARACTERS, CHARACTER_ORDER } from "@/lib/stages";
import type { CharacterId } from "@/lib/types";

export default function TitleScreen() {
  const { state, goto, setPlayerName, setCharacter } = useGame();
  const [name, setName] = useState(state.playerName);

  function begin() {
    const trimmed = name.trim() || "CASTAWAY";
    setPlayerName(trimmed);
    goto("intro");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-6 gap-4">
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

      <h1 className="font-pixel text-white text-2xl sm:text-3xl tracking-[0.18em] drop-shadow-[2px_2px_0_#444]">
        SPEAK
        <span className="mx-3 text-sm text-ut-dim">—OR—</span>
        <span className="text-ut-soul">STARVE</span>
      </h1>

      {/* Character selection */}
      <div className="flex flex-col items-center gap-2">
        <p className="ut-label text-ut-dim">CHOOSE YOUR CASTAWAY</p>
        <div className="flex gap-4">
          {CHARACTER_ORDER.map((id) => {
            const selected = state.character === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCharacter(id as CharacterId)}
                aria-label={`Choose character ${id}`}
                aria-pressed={selected}
                className={[
                  "relative w-[88px] h-[140px] bg-ut-dust border-4 overflow-hidden transition-colors focus:outline-none",
                  selected
                    ? "border-ut-act ring-2 ring-ut-act"
                    : "border-ut-dim hover:border-white opacity-70 hover:opacity-100",
                ].join(" ")}
              >
                <Image
                  src={CHARACTERS[id].sprite}
                  alt={id}
                  fill
                  sizes="88px"
                  className="object-cover object-top"
                  style={{ imageRendering: "pixelated" }}
                  priority
                />
                {selected && (
                  <span
                    aria-hidden
                    className="absolute -left-3 top-1/2 -translate-y-1/2"
                  >
                    <span className="soul" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name input */}
      <div className="flex flex-col items-center gap-1">
        <label htmlFor="player-name" className="ut-label text-ut-dim">
          NAME THE CASTAWAY
        </label>
        <input
          id="player-name"
          type="text"
          maxLength={12}
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              begin();
            }
          }}
          placeholder="CASTAWAY"
          className="font-pixel text-[12px] tracking-[0.2em] uppercase text-center
                     bg-black text-white border-2 border-white px-3 py-2 w-56
                     focus:outline-none focus:border-ut-act focus:text-ut-act"
        />
      </div>

      <button onClick={begin} className="ut-btn animate-blink">
        ▶ PRESS ENTER TO BEGIN
      </button>

      <p className="absolute bottom-4 right-4 ut-pixel-text text-ut-dim opacity-60">
        v0.1 · NEXT.JS
      </p>
    </div>
  );
}
