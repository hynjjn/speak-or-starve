"use client";

import { ITEMS } from "@/lib/stages";
import { useGame } from "@/lib/game-state";

export default function HUD() {
  const { state } = useGame();
  const pct = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 bg-black border-b-4 border-white">
      <div className="flex items-center gap-3">
        <span className="ut-label">CASTAWAY</span>
        <span className="ut-pixel-text text-ut-dim">LV 1</span>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-md">
        <span className="ut-label">HP</span>
        <div className="relative h-4 flex-1 hp-track">
          <div
            className="absolute inset-y-0 left-0 hp-fill transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="ut-pixel-text">
          {state.hp}/{state.maxHp}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="ut-label mr-2">BAG</span>
        {state.inventory.length === 0 && (
          <span className="ut-pixel-text text-ut-dim">— EMPTY —</span>
        )}
        {state.inventory.map((id) => (
          <span
            key={id}
            title={ITEMS[id].name}
            className="ut-pixel-text text-ut-act border border-white px-1"
          >
            {ITEMS[id].icon}
          </span>
        ))}
      </div>
    </div>
  );
}
