"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HUD from "./HUD";
import Typewriter from "./Typewriter";
import { useGame } from "@/lib/game-state";
import { ITEMS, STAGES } from "@/lib/stages";
import { gradeUtteranceAsync, type GradeResult } from "@/lib/speech-api";

type Phase =
  | "intro" // watch + inner voice
  | "menu" // soul navigates FIGHT/ACT/ITEM/MERCY
  | "speak" // speaking mission active
  | "judging" // awaiting grade
  | "result" // grade returned
  | "victory";

const MENU = ["SPEAK", "ACT", "ITEM", "MERCY"] as const;
type MenuOpt = (typeof MENU)[number];

export default function Encounter() {
  const { state, damage, clearStage, goto } = useGame();
  const stage = STAGES.find((s) => s.id === state.currentStageId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [introIdx, setIntroIdx] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [menuIdx, setMenuIdx] = useState(0);
  const [missionIdx, setMissionIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [shake, setShake] = useState(false);
  const [resultLineDone, setResultLineDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const introLines = useMemo(
    () => (stage ? [stage.watchLine, stage.innerVoice] : []),
    [stage],
  );

  const mission = stage?.missions[missionIdx];

  // Intro keyboard handler
  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (!introDone) return;
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        if (introIdx < introLines.length - 1) {
          setIntroIdx((i) => i + 1);
          setIntroDone(false);
        } else {
          setPhase("menu");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, introDone, introIdx, introLines.length]);

  // Menu keyboard handler
  useEffect(() => {
    if (phase !== "menu") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a")
        setMenuIdx((i) => (i + MENU.length - 1) % MENU.length);
      if (e.key === "ArrowRight" || e.key === "d")
        setMenuIdx((i) => (i + 1) % MENU.length);
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        choose(MENU[menuIdx]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Speak countdown
  useEffect(() => {
    if (phase !== "speak" || !mission) return;
    setTimeLeft(mission.timeLimitMs);
    setTranscript("");
    inputRef.current?.focus();
    const start = performance.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, mission.timeLimitMs - (performance.now() - start));
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        // grade what we have (possibly empty)
        finalize();
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mission]);

  if (!stage) return null;

  function choose(opt: MenuOpt) {
    if (opt === "SPEAK") setPhase("speak");
    if (opt === "ACT") {
      // peek the hint as a free action
      setGrade({
        score: 0,
        passed: false,
        message: `* (hint) ${stage!.missions[missionIdx].hint}`,
      });
      setPhase("result");
    }
    if (opt === "ITEM") {
      setGrade({
        score: 0,
        passed: false,
        message: state.inventory.length
          ? `* You rummage. ${ITEMS[state.inventory[0]].blurb}`
          : "* Your bag is empty. The sea sloshes inside your ribs.",
      });
      setPhase("result");
    }
    if (opt === "MERCY") {
      // forfeit the stage — costs HP, no reward
      setShake(true);
      damage(stage!.damageOnFail);
      setGrade({
        score: 0,
        passed: false,
        message: "* You give up speaking. The wind takes a bite of you.",
      });
      setTimeout(() => setShake(false), 400);
      setPhase("result");
    }
  }

  async function finalize() {
    setPhase("judging");
    const m = stage!.missions[missionIdx];
    const result = await gradeUtteranceAsync(transcript, m.target);
    setGrade(result);
    if (!result.passed) {
      setShake(true);
      damage(stage!.damageOnFail);
      setTimeout(() => setShake(false), 400);
    }
    setPhase("result");
  }

  function continueAfterResult() {
    if (!grade) return;
    setGrade(null);
    setResultLineDone(false);

    if (grade.passed) {
      const isLast = missionIdx >= stage!.missions.length - 1;
      if (isLast) {
        setPhase("victory");
      } else {
        setMissionIdx((i) => i + 1);
        setPhase("menu");
      }
    } else {
      // back to menu on fail (HP already deducted)
      setPhase("menu");
    }
  }

  // Result keyboard handler
  useEffect(() => {
    if (phase !== "result") return;
    const onKey = (e: KeyboardEvent) => {
      if (!resultLineDone) return;
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        continueAfterResult();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Victory keyboard handler
  useEffect(() => {
    if (phase !== "victory") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        clearStage(stage!.id, stage!.reward);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={["absolute inset-0 flex flex-col", shake && "animate-shake"].filter(Boolean).join(" ")}>
      <HUD />

      {/* Enemy / scene panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-ut-dust">
        <BiomeArt biome={stage.biome} />

        <div className="relative z-10 text-center">
          <div className="ut-label text-ut-soul mb-2">! ENCOUNTER</div>
          <h2 className="font-pixel text-2xl tracking-widest">{stage.title}</h2>
          <p className="ut-pixel-text text-ut-dim mt-2 max-w-sm mx-auto">
            {stage.subtitle}
          </p>
        </div>

        {phase === "judging" && (
          <div className="absolute bottom-4 ut-pixel-text text-ut-act animate-flash">
            ... LISTENING ...
          </div>
        )}
      </div>

      {/* Dialog / menu / mission panel */}
      <div className="bg-black border-t-4 border-white p-4 min-h-[230px]">
        {phase === "intro" && (
          <DialogPanel
            line={introLines[introIdx]}
            onDone={() => setIntroDone(true)}
            footer={introDone ? "[Z] CONTINUE ▼" : ""}
          />
        )}

        {phase === "menu" && (
          <MenuPanel
            mission={mission!}
            menuIdx={menuIdx}
            onPick={(i) => {
              setMenuIdx(i);
              choose(MENU[i]);
            }}
            missionIdx={missionIdx}
            total={stage.missions.length}
          />
        )}

        {phase === "speak" && (
          <SpeakPanel
            mission={mission!}
            transcript={transcript}
            setTranscript={setTranscript}
            timeLeft={timeLeft}
            inputRef={inputRef}
            onSubmit={() => finalize()}
            onCancel={() => setPhase("menu")}
          />
        )}

        {(phase === "result" || phase === "judging") && grade && (
          <DialogPanel
            line={grade.message + (grade.score ? ` (score ${(grade.score * 100).toFixed(0)})` : "")}
            onDone={() => setResultLineDone(true)}
            footer={resultLineDone ? "[Z] CONTINUE ▼" : ""}
          />
        )}

        {phase === "victory" && (
          <div className="text-center space-y-3">
            <p className="ut-dialog text-ut-act">
              * You earned: {stage.reward.map((r) => ITEMS[r].name).join(" + ")}
            </p>
            <p className="ut-pixel-text text-ut-dim">
              {stage.reward.map((r) => ITEMS[r].blurb).join(" / ")}
            </p>
            <button className="ut-btn ut-btn-active animate-blink" onClick={() => clearStage(stage.id, stage.reward)}>
              ▶ PRESS [Z] TO LEAVE
            </button>
          </div>
        )}
      </div>

      {/* abort */}
      <button
        onClick={() => goto("overworld")}
        className="absolute top-2 right-2 ut-pixel-text text-ut-dim hover:text-white"
      >
        [ESC] ABANDON
      </button>
    </div>
  );
}

/* -- subcomponents ------------------------------------------------------- */

function DialogPanel({
  line,
  onDone,
  footer,
}: {
  line: string;
  onDone?: () => void;
  footer?: string;
}) {
  return (
    <div className="relative flex items-start gap-4">
      <div className="soul soul-lg mt-2 animate-bob" />
      <div className="flex-1">
        <Typewriter text={line} className="ut-dialog" onDone={onDone} />
        {footer && (
          <p className="mt-3 ut-pixel-text text-ut-dim animate-blink">{footer}</p>
        )}
      </div>
    </div>
  );
}

function MenuPanel({
  mission,
  menuIdx,
  onPick,
  missionIdx,
  total,
}: {
  mission: { prompt: string; hint: string; target: string };
  menuIdx: number;
  onPick: (i: number) => void;
  missionIdx: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="soul mt-1" />
        <div>
          <p className="ut-dialog">{mission.prompt}</p>
          <p className="ut-pixel-text text-ut-dim mt-1">
            MISSION {missionIdx + 1} / {total} · CHOOSE AN ACTION
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-1">
        {MENU.map((label, i) => (
          <button
            key={label}
            onClick={() => onPick(i)}
            className={[
              "ut-btn relative",
              i === menuIdx && "ut-btn-active",
              label === "SPEAK" && "border-ut-fight text-ut-fight",
              label === "ACT" && "border-ut-act text-ut-act",
              label === "ITEM" && "border-ut-item text-ut-item",
              label === "MERCY" && "border-ut-mercy text-ut-mercy",
              i === menuIdx && "bg-white !text-black",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {i === menuIdx && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2">
                <span className="soul" />
              </span>
            )}
            {label}
          </button>
        ))}
      </div>
      <p className="ut-pixel-text text-ut-dim">
        ◀ ▶ MOVE · [Z / ENTER] SELECT
      </p>
    </div>
  );
}

function SpeakPanel({
  mission,
  transcript,
  setTranscript,
  timeLeft,
  inputRef,
  onSubmit,
  onCancel,
}: {
  mission: { prompt: string; target: string; hint: string; timeLimitMs: number };
  transcript: string;
  setTranscript: (s: string) => void;
  timeLeft: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const pct = Math.max(0, Math.min(100, (timeLeft / mission.timeLimitMs) * 100));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="ut-label text-ut-fight">▶ SPEAK</span>
        <div className="relative h-2 flex-1 hp-track">
          <div
            className="absolute inset-y-0 left-0 hp-fill transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="ut-pixel-text">{(timeLeft / 1000).toFixed(1)}s</span>
      </div>

      <p className="ut-pixel-text text-ut-dim">TARGET PHRASE</p>
      <p className="ut-dialog text-ut-act border-2 border-ut-act px-3 py-2">
        “{mission.target}”
      </p>

      <p className="ut-pixel-text text-ut-dim">
        Speak the line aloud — and type/paste your transcript:
      </p>
      <input
        ref={inputRef}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        autoFocus
        placeholder="(type what you said)"
        className="bg-black border-2 border-white text-white font-dialog text-xl px-3 py-2 outline-none focus:border-ut-act"
      />
      <div className="flex items-center justify-between mt-1">
        <p className="ut-pixel-text text-ut-dim">
          [ENTER] SUBMIT · [ESC] BACK
        </p>
        <button className="ut-btn" onClick={onSubmit}>
          ▶ SUBMIT
        </button>
      </div>
      <p className="ut-pixel-text text-ut-dim opacity-70">
        // TODO: connect to speech-to-text API. UI ready.
      </p>
    </div>
  );
}

function BiomeArt({ biome }: { biome: "beach" | "forest" | "ravine" | "cliff" }) {
  // simple stacked pixel-rect art per biome
  const palettes = {
    beach: ["#d8b878", "#c8a868", "#1e5fa8", "#0a0a0a"],
    forest: ["#1a5c34", "#0d2b1a", "#3a3a3a", "#0a0a0a"],
    ravine: ["#5a3322", "#3a1f12", "#2a2a2a", "#0a0a0a"],
    cliff: ["#3a3a3a", "#1a1a1a", "#1e5fa8", "#0a0a0a"],
  } as const;
  const p = palettes[biome];
  return (
    <svg
      viewBox="0 0 320 120"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-90"
    >
      <rect x="0" y="0" width="320" height="120" fill={p[3]} />
      <rect x="0" y="80" width="320" height="40" fill={p[1]} />
      <rect x="0" y="92" width="320" height="28" fill={p[0]} />
      {biome === "forest" && (
        <>
          {[20, 70, 120, 180, 240, 290].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="40" width="6" height="44" fill="#0d2b1a" />
              <polygon
                points={`${x - 18},60 ${x + 18},60 ${x},30`}
                fill="#1a5c34"
                stroke="#000"
              />
            </g>
          ))}
        </>
      )}
      {biome === "beach" && (
        <>
          <circle cx="260" cy="34" r="14" fill="#ffe600" />
          <rect x="0" y="76" width="320" height="2" fill="#fff" opacity="0.4" />
        </>
      )}
      {biome === "ravine" && (
        <>
          <polygon points="40,80 80,40 120,80" fill="#2a2a2a" />
          <polygon points="180,80 230,30 280,80" fill="#1a1a1a" />
        </>
      )}
      {biome === "cliff" && (
        <>
          <rect x="0" y="60" width="320" height="20" fill="#1e5fa8" />
          <polygon points="240,40 248,28 256,40" fill="#fff" />
          <rect x="244" y="40" width="8" height="14" fill="#ddd" />
        </>
      )}
    </svg>
  );
}
