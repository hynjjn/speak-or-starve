"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useGame } from "@/lib/game-state";
import { ITEMS } from "@/lib/stages";

const COPY = {
  perfect: {
    title: "PERFECT ESCAPE",
    color: "text-ut-mercy",
    body: [
      "* A coast-guard cutter sees your flare.",
      "* Spotlights drown the beach.",
      "* You speak your name into the radio — clear, unshaking.",
      "* Somewhere, someone takes your hand.",
      "* You made it. You spoke yourself home.",
    ],
  },
  barely: {
    title: "BARELY SURVIVED",
    color: "text-ut-act",
    body: [
      "* A helicopter rotor cuts the morning.",
      "* You can barely lift your head.",
      "* The medic asks your name. You whisper it.",
      "* Close. Too close. But you spoke just enough.",
    ],
  },
  chief: {
    title: "ISLAND CHIEF",
    color: "text-ut-fight",
    body: [
      "* The ship vanishes. The horizon closes.",
      "* You build a roof. You name the birds.",
      "* You stop watching the sea.",
      "* The island keeps you — but you have become its voice.",
      "* (To be continued...)",
    ],
  },
};

export default function EndingScreen() {
  const { state, reset } = useGame();
  const kind = state.endingKind ?? "chief";
  if (kind === "gameover") return null;
  const c = COPY[kind];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "z" || e.key === "Z") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-10 gap-6">
      <h1 className={["font-pixel text-3xl tracking-widest", c.color].join(" ")}>
        ▣ {c.title} ▣
      </h1>

      <div className="ut-box p-6 max-w-xl w-full space-y-2">
        {c.body.map((line, i) => (
          <p key={i} className="ut-dialog">
            {line}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="ut-pixel-text text-ut-dim">FINAL HP {state.hp}/{state.maxHp}</div>
        <div className="ut-pixel-text text-ut-dim">|</div>
        <div className="flex items-center gap-1">
          {state.inventory.map((id) => (
            <span
              key={id}
              className="relative block w-7 h-7 border border-white bg-ut-dust"
              title={ITEMS[id].name}
            >
              <Image
                src={ITEMS[id].sprite}
                alt={ITEMS[id].name}
                fill
                sizes="28px"
                className="object-contain p-0.5"
              />
            </span>
          ))}
        </div>
      </div>

      <button className="ut-btn animate-blink" onClick={() => reset()}>
        ▶ PRESS [Z] TO RETURN TO TITLE
      </button>
    </div>
  );
}
