"use client";

import { useEffect, useRef, useState } from "react";
import HUD from "./HUD";
import { useGame } from "@/lib/game-state";
import { STAGES } from "@/lib/stages";

const PLAYER_STEP = 2.4;

export default function Overworld() {
  const { state, enterStage } = useGame();
  const [pos, setPos] = useState({ x: 12, y: 78 });
  const keys = useRef<Set<string>>(new Set());
  const [hintStageId, setHintStageId] = useState<number | null>(null);

  // movement
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
        // try to enter the closest stage if overlapping
        const target = closestStage(pos);
        if (target && !state.clearedStages.includes(target.id)) {
          enterStage(target.id);
        }
      }
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [pos, state.clearedStages, enterStage]);

  // game loop
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPos((p) => {
        let { x, y } = p;
        if (keys.current.has("ArrowLeft") || keys.current.has("a")) x -= PLAYER_STEP;
        if (keys.current.has("ArrowRight") || keys.current.has("d")) x += PLAYER_STEP;
        if (keys.current.has("ArrowUp") || keys.current.has("w")) y -= PLAYER_STEP;
        if (keys.current.has("ArrowDown") || keys.current.has("s")) y += PLAYER_STEP;
        x = Math.max(4, Math.min(96, x));
        y = Math.max(8, Math.min(92, y));
        return { x, y };
      });

      const t = closestStage(pos);
      setHintStageId(t && !state.clearedStages.includes(t.id) ? t.id : null);

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [pos, state.clearedStages]);

  const hintStage = hintStageId ? STAGES.find((s) => s.id === hintStageId) : null;
  const nextStage = STAGES.find((s) => !state.clearedStages.includes(s.id));

  return (
    <div className="absolute inset-0 flex flex-col">
      <HUD />

      <div className="relative flex-1 overflow-hidden bg-ut-ocean">
        {/* ocean tile pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #1e5fa8 0 12px, #2a6dc0 12px 24px)",
          }}
        />
        {/* island silhouette */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <pattern
              id="sand"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <rect width="3" height="3" fill="#d8b878" />
              <rect width="1" height="1" fill="#c8a868" />
            </pattern>
            <pattern
              id="forest"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <rect width="4" height="4" fill="#1a5c34" />
              <rect x="1" y="1" width="2" height="2" fill="#0d2b1a" />
            </pattern>
          </defs>

          {/* sand ring */}
          <polygon
            points="10,82 6,60 14,38 30,22 52,14 74,18 90,32 94,52 88,74 70,88 42,90 20,88"
            fill="url(#sand)"
            stroke="#000"
            strokeWidth="0.6"
          />
          {/* forest inner */}
          <polygon
            points="22,72 18,56 26,40 42,30 60,28 76,38 82,54 76,70 62,80 40,82"
            fill="url(#forest)"
            stroke="#000"
            strokeWidth="0.4"
          />
          {/* mountain at NE */}
          <polygon
            points="72,40 80,22 88,40"
            fill="#3a3a3a"
            stroke="#000"
            strokeWidth="0.4"
          />
          <polygon
            points="76,40 80,30 84,40"
            fill="#eee"
            stroke="#000"
            strokeWidth="0.3"
          />
        </svg>

        {/* stage nodes */}
        {STAGES.map((s) => {
          const cleared = state.clearedStages.includes(s.id);
          const available =
            !cleared &&
            (nextStage ? s.id === nextStage.id : false);
          return (
            <div
              key={s.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${s.nodePosition.x}%`, top: `${s.nodePosition.y}%` }}
            >
              <div
                className={[
                  "w-6 h-6 border-2 border-black flex items-center justify-center font-pixel text-[10px]",
                  cleared
                    ? "bg-ut-mercy text-black"
                    : available
                      ? "bg-ut-act text-black animate-bob"
                      : "bg-ut-dim text-black opacity-70",
                ].join(" ")}
              >
                {cleared ? "✓" : s.id}
              </div>
              <div
                className={[
                  "mt-1 ut-pixel-text px-1 border border-black bg-black/70",
                  cleared ? "text-ut-mercy" : "text-white",
                ].join(" ")}
              >
                {s.title.split("—")[1]?.trim() ?? s.title}
              </div>
            </div>
          );
        })}

        {/* player soul */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-75"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="soul animate-bob" aria-label="player" />
        </div>

        {/* prompt overlay */}
        {hintStage && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-black border-2 border-white ut-pixel-text">
            ▶ {hintStage.title} — PRESS [Z / ENTER]
          </div>
        )}
      </div>

      <div className="bg-black border-t-4 border-white px-4 py-2 flex items-center justify-between">
        <p className="ut-pixel-text text-ut-dim">
          MOVE: ARROWS / WASD &nbsp; · &nbsp; ENTER STAGE: Z / ENTER
        </p>
        <p className="ut-pixel-text text-ut-act">
          {state.clearedStages.length}/{STAGES.length} CLEARED
        </p>
      </div>
    </div>
  );
}

function closestStage(pos: { x: number; y: number }) {
  let best: (typeof STAGES)[number] | null = null;
  let bestD = Infinity;
  for (const s of STAGES) {
    const dx = s.nodePosition.x - pos.x;
    const dy = s.nodePosition.y - pos.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  if (bestD <= 40) return best;
  return null;
}
