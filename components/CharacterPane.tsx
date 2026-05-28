"use client";

import Image from "next/image";
import { CHARACTERS, ITEMS, STAGES } from "@/lib/stages";
import { useGame } from "@/lib/game-state";
import EscapeTimer from "./EscapeTimer";

export default function CharacterPane() {
  const { state } = useGame();
  const name = state.playerName || "CHARACTER";
  const pct = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));
  const sprite = CHARACTERS[state.character].sprite;

  return (
    <aside className="flex flex-col w-[200px] shrink-0 bg-black border-r-4 border-white">
      {/* Name header */}
      <div className="px-3 py-3 border-b-2 border-white text-center">
        <p className="ut-label text-ut-dim mb-1">SPEAK OR STARVE</p>
        <p className="font-pixel text-[14px] tracking-[0.18em] text-white truncate">
          {name}
        </p>
        {/* <p className="ut-pixel-text text-ut-dim mt-1">LV 1</p> */}
      </div>

      {/* Full character image */}
      <div className="relative flex-1 min-h-0 bg-ut-dust border-b-2 border-white">
        <Image
          src={sprite}
          alt={name}
          fill
          sizes="200px"
          className="object-contain"
          style={{ imageRendering: "pixelated" }}
          priority
        />
      </div>

      {/* HP bar */}
      <div className="px-3 py-2 border-b-2 border-white">
        <div className="flex items-center justify-between mb-1">
          <span className="ut-label">HP</span>
          <span className="ut-pixel-text">
            {state.hp}/{state.maxHp}
          </span>
        </div>
        <div className="relative h-3 hp-track">
          <div
            className="absolute inset-y-0 left-0 hp-fill transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Escape timer */}
      <EscapeTimer />

      {/* Item badges */}
      <div className="px-3 py-3">
        <p className="ut-label text-ut-dim mb-2 text-center">ITEMS</p>
        <div className="grid grid-cols-4 gap-1">
          {STAGES.map((s) => {
            const item = ITEMS[s.reward[0]];
            const acquired = state.clearedStages.includes(s.id);
            return (
              <div
                key={s.id}
                title={`${item.name} — ${acquired ? "acquired" : "locked"}`}
                className={[
                  "relative aspect-square border-2 bg-ut-dust",
                  acquired ? "border-ut-hp" : "border-ut-dim",
                ].join(" ")}
              >
                <Image
                  src={item.sprite}
                  alt={item.name}
                  fill
                  sizes="44px"
                  className="object-contain p-0.5"
                  style={{
                    filter: acquired ? "none" : "grayscale(100%)",
                    opacity: acquired ? 1 : 0.4,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
