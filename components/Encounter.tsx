"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Typewriter, { type TypewriterHandle } from "./Typewriter";
import { useGame } from "@/lib/game-state";
import { ITEMS, STAGES } from "@/lib/stages";
import {
  gradeFromUtterances,
  type GradeResult,
  type Utterance,
  type WordBreakdown,
} from "@/lib/speech-api";

type Phase =
  | "intro" // watch + inner voice
  | "menu" // soul navigates FIGHT/ACT/ITEM/MERCY
  | "speak" // speaking mission active (mic open)
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
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [shake, setShake] = useState(false);
  const [resultLineDone, setResultLineDone] = useState(false);
  const introTw = useRef<TypewriterHandle>(null);
  const resultTw = useRef<TypewriterHandle>(null);

  const introLines = useMemo(
    () => (stage ? [stage.watchLine, stage.innerVoice] : []),
    [stage],
  );

  const mission = stage?.missions[missionIdx];

  function advanceIntro() {
    if (!introDone) {
      introTw.current?.complete();
      return;
    }
    if (introIdx < introLines.length - 1) {
      setIntroIdx((i) => i + 1);
      setIntroDone(false);
    } else {
      setPhase("menu");
    }
  }

  // Intro keyboard handler
  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        advanceIntro();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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

  const handleSpeakResult = useCallback(
    (result: GradeResult) => {
      setGrade(result);
      if (!result.passed) {
        setShake(true);
        damage(stage!.damageOnFail);
        setTimeout(() => setShake(false), 400);
      }
      setPhase("result");
    },
    [damage, stage],
  );

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

  function advanceResult() {
    if (!resultLineDone) {
      resultTw.current?.complete();
      return;
    }
    continueAfterResult();
  }

  // Result keyboard handler
  useEffect(() => {
    if (phase !== "result") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        advanceResult();
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

        {phase === "speak" && (
          <div className="absolute bottom-4 ut-pixel-text text-ut-act animate-flash">
            ... SPEAK NOW ...
          </div>
        )}
      </div>

      {/* Dialog / menu / mission panel */}
      <div className="bg-black border-t-4 border-white p-4 min-h-[230px]">
        {phase === "intro" && (
          <DialogPanel
            ref={introTw}
            line={introLines[introIdx]}
            onDone={() => setIntroDone(true)}
            footer={introDone ? "[Z / CLICK] CONTINUE" : "[Z / CLICK] SKIP"}
            arrowReady={introDone}
            onAdvance={advanceIntro}
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
            onResult={handleSpeakResult}
            onCancel={() => setPhase("menu")}
          />
        )}

        {phase === "result" && grade && (
          <div className="flex flex-col gap-3">
            <DialogPanel
              ref={resultTw}
              line={grade.message + (grade.score ? ` (score ${(grade.score * 100).toFixed(0)})` : "")}
              onDone={() => setResultLineDone(true)}
              footer={resultLineDone ? "[Z / CLICK] CONTINUE" : "[Z / CLICK] SKIP"}
              arrowReady={resultLineDone}
              onAdvance={advanceResult}
            />
            {grade.detail && <ResultDetail detail={grade.detail} />}
          </div>
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

const DialogPanel = forwardRef<
  TypewriterHandle,
  {
    line: string;
    onDone?: () => void;
    footer?: string;
    onAdvance?: () => void;
    arrowReady?: boolean;
  }
>(function DialogPanel({ line, onDone, footer, onAdvance, arrowReady }, ref) {
  const Wrapper: React.ElementType = onAdvance ? "button" : "div";
  const wrapperProps = onAdvance
    ? {
        type: "button" as const,
        onClick: onAdvance,
        "aria-label": arrowReady ? "Continue" : "Skip to end of line",
        className:
          "relative w-full flex items-start gap-4 text-left cursor-pointer hover:bg-white/5 focus:outline-none focus:bg-white/5 transition-colors",
      }
    : { className: "relative flex items-start gap-4" };
  return (
    <Wrapper {...wrapperProps}>
      <div className="soul soul-lg mt-2 animate-bob" />
      <div className="flex-1 pr-10">
        <Typewriter ref={ref} text={line} className="ut-dialog" onDone={onDone} />
        {footer && (
          <p className="mt-3 ut-pixel-text text-ut-dim animate-blink">{footer}</p>
        )}
      </div>
      {onAdvance && (
        <span
          className={[
            "absolute bottom-0 right-2 font-pixel text-4xl leading-none",
            arrowReady ? "text-ut-act animate-blink" : "text-ut-dim opacity-60",
          ].join(" ")}
          aria-hidden="true"
        >
          ▼
        </span>
      )}
    </Wrapper>
  );
});

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

const SILENCE_MS = 4000;

function SpeakPanel({
  mission,
  onResult,
  onCancel,
}: {
  mission: { prompt: string; target: string; hint: string; timeLimitMs: number };
  onResult: (grade: GradeResult) => void;
  onCancel: () => void;
}) {
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livePartial, setLivePartial] = useState("");
  const [recognized, setRecognized] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);
  const utterancesRef = useRef<Utterance[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalizedRef = useRef(false);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    onResult(gradeFromUtterances(utterancesRef.current));
  }, [onResult]);

  const referenceWordCount = useCallback(
    () => mission.target.trim().split(/\s+/).filter(Boolean).length,
    [mission.target],
  );

  const countSpokenWords = useCallback(() => {
    let count = 0;
    for (const { nbest } of utterancesRef.current) {
      const ws = Array.isArray(nbest?.Words) ? nbest.Words : [];
      for (const w of ws) {
        const err = w?.PronunciationAssessment?.ErrorType;
        if (err && err !== "Omission" && err !== "Insertion") count++;
      }
    }
    return count;
  }, []);

  const handleStop = useCallback(() => {
    const reco = recognizerRef.current;
    if (!reco) return;
    clearSilenceTimer();
    setListening(false);
    setBusy(true);
    reco.stopContinuousRecognitionAsync(
      () => {
        // sessionStopped will close + finalize
      },
      (err: unknown) => {
        setError(`Failed to stop: ${String(err)}`);
        try {
          reco.close();
        } catch {
          // ignore
        }
        recognizerRef.current = null;
        setBusy(false);
      },
    );
  }, [clearSilenceTimer]);

  const handleStart = useCallback(async () => {
    setError(null);
    setLivePartial("");
    setRecognized("");
    setBusy(true);
    utterancesRef.current = [];
    finalizedRef.current = false;
    clearSilenceTimer();

    try {
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const detail = await tokenRes.json().catch(() => ({}));
        throw new Error(
          detail?.error || `Token endpoint returned ${tokenRes.status}`,
        );
      }
      const { token, region } = (await tokenRes.json()) as {
        token: string;
        region: string;
      };

      const SDK = await import("microsoft-cognitiveservices-speech-sdk");
      const {
        SpeechConfig,
        AudioConfig,
        SpeechRecognizer,
        PronunciationAssessmentConfig,
        PronunciationAssessmentGradingSystem,
        PronunciationAssessmentGranularity,
        PropertyId,
        ResultReason,
        CancellationReason,
      } = SDK;

      const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";

      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      const reco = new SpeechRecognizer(speechConfig, audioConfig);

      const paConfig = new PronunciationAssessmentConfig(
        mission.target,
        PronunciationAssessmentGradingSystem.HundredMark,
        PronunciationAssessmentGranularity.Phoneme,
        true,
      );
      paConfig.enableProsodyAssessment = true;
      paConfig.applyTo(reco);

      const armSilenceTimer = () => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          handleStop();
        }, SILENCE_MS);
      };

      reco.recognizing = (
        _s: unknown,
        e: { result: { text?: string } },
      ) => {
        setLivePartial(e.result.text ?? "");
        armSilenceTimer();
      };

      reco.recognized = (
        _s: unknown,
        e: {
          result: {
            reason: number;
            text?: string;
            properties: { getProperty: (p: number) => string };
          };
        },
      ) => {
        setLivePartial("");
        if (e.result.reason !== ResultReason.RecognizedSpeech) {
          armSilenceTimer();
          return;
        }
        const raw = e.result.properties.getProperty(
          PropertyId.SpeechServiceResponse_JsonResult,
        );
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          const nbest = parsed?.NBest?.[0];
          if (!nbest) return;
          utterancesRef.current.push({
            text: e.result.text ?? nbest.Display ?? "",
            nbest,
          });
          setRecognized(
            utterancesRef.current
              .map((u) => u.text)
              .join(" ")
              .trim(),
          );
          const refCount = referenceWordCount();
          if (refCount > 0 && countSpokenWords() >= refCount) {
            clearSilenceTimer();
            handleStop();
          } else {
            armSilenceTimer();
          }
        } catch {
          armSilenceTimer();
        }
      };

      reco.canceled = (
        _s: unknown,
        e: { reason: number; errorDetails?: string },
      ) => {
        clearSilenceTimer();
        if (e.reason === CancellationReason.Error) {
          setError(`Recognition canceled: ${e.errorDetails ?? "unknown error"}`);
        }
        try {
          reco.close();
        } catch {
          // ignore
        }
        recognizerRef.current = null;
        setListening(false);
        setBusy(false);
      };

      reco.sessionStopped = () => {
        clearSilenceTimer();
        setLivePartial("");
        try {
          reco.close();
        } catch {
          // ignore
        }
        recognizerRef.current = null;
        setListening(false);
        setBusy(false);
        finalize();
      };

      recognizerRef.current = reco;

      await new Promise<void>((resolve, reject) => {
        reco.startContinuousRecognitionAsync(
          () => resolve(),
          (err: unknown) =>
            reject(new Error(typeof err === "string" ? err : String(err))),
        );
      });

      setListening(true);
      setBusy(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
        } catch {
          // ignore
        }
        recognizerRef.current = null;
      }
      setListening(false);
      setBusy(false);
    }
  }, [
    mission.target,
    clearSilenceTimer,
    countSpokenWords,
    finalize,
    handleStop,
    referenceWordCount,
  ]);

  // Auto-start the mic when the panel mounts so the player doesn't have to
  // click SPEAK first. Guarded against StrictMode double-mount.
  const didAutoStartRef = useRef(false);
  useEffect(() => {
    if (didAutoStartRef.current) return;
    didAutoStartRef.current = true;
    handleStart();
  }, [handleStart]);

  // ESC cancels (only when not actively listening)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !listening && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening, busy, onCancel]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
        } catch {
          // ignore
        }
        recognizerRef.current = null;
      }
    };
  }, [clearSilenceTimer]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="ut-label text-ut-fight">▶ SPEAK</span>
        <div className="ml-auto flex items-center gap-2">
          {listening && (
            <span className="flex items-center gap-1 ut-pixel-text text-ut-dmg">
              <span className="inline-block w-2 h-2 bg-ut-dmg animate-blink" />
              REC
            </span>
          )}
          {busy && !listening && (
            <span className="ut-pixel-text text-ut-act animate-flash">...</span>
          )}
        </div>
      </div>

      <p className="ut-pixel-text text-ut-dim">TARGET PHRASE</p>
      <p className="ut-dialog text-ut-act border-2 border-ut-act px-3 py-2">
        &ldquo;{mission.target}&rdquo;
      </p>

      <div className="bg-black border-2 border-white min-h-[3rem] px-3 py-2">
        <p className="font-dialog text-lg leading-tight">
          {recognized && <span>{recognized}</span>}
          {recognized && livePartial && " "}
          {livePartial && <span className="opacity-60">{livePartial}</span>}
          {!recognized && !livePartial && (
            <span className="ut-pixel-text text-ut-dim opacity-60">
              {listening
                ? "(speak now...)"
                : busy
                  ? "(opening the watch...)"
                  : "(press SPEAK to begin)"}
            </span>
          )}
        </p>
      </div>

      {error && (
        <p className="ut-pixel-text text-ut-dmg border-2 border-ut-dmg px-2 py-1">
          ! {error}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        <p className="ut-pixel-text text-ut-dim">
          {listening ? "SILENCE ENDS THE TAKE" : "[ESC] BACK"}
        </p>
        <div className="flex gap-2">
          {!listening && !busy && (
            <>
              <button
                type="button"
                className="ut-btn"
                onClick={onCancel}
              >
                BACK
              </button>
              <button
                type="button"
                className="ut-btn border-ut-fight text-ut-fight hover:bg-ut-fight hover:text-black"
                onClick={handleStart}
              >
                ▶ SPEAK
              </button>
            </>
          )}
          {listening && (
            <button
              type="button"
              className="ut-btn border-ut-dmg text-ut-dmg hover:bg-ut-dmg hover:text-black"
              onClick={handleStop}
            >
              ■ STOP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultDetail({
  detail,
}: {
  detail: NonNullable<GradeResult["detail"]>;
}) {
  const { scores, words } = detail;
  return (
    <div className="flex flex-col gap-2 pl-10 pr-2">
      <div className="flex flex-wrap gap-2">
        <ScoreChip label="ACC" value={scores.accuracy} />
        <ScoreChip label="FLU" value={scores.fluency} />
        <ScoreChip label="CMP" value={scores.completeness} />
        <ScoreChip label="PRO" value={scores.prosody} />
        <ScoreChip label="PRN" value={scores.pronunciation} />
      </div>
      {words.length > 0 && (
        <div className="flex flex-wrap gap-1 border-2 border-white bg-black/50 px-2 py-2">
          {words.map((w, i) => (
            <WordChip key={`${w.word}-${i}`} word={w} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  const v = Math.round(value);
  const color =
    v >= 80
      ? "border-ut-mercy text-ut-mercy"
      : v >= 60
        ? "border-ut-act text-ut-act"
        : "border-ut-dmg text-ut-dmg";
  return (
    <span
      className={[
        "ut-pixel-text border-2 px-2 py-1 bg-black",
        color,
      ].join(" ")}
    >
      {label} {v}
    </span>
  );
}

function WordChip({ word }: { word: WordBreakdown }) {
  const err = word.errorType;
  const label = word.word || "·";
  const tip =
    typeof word.accuracy === "number"
      ? `${label} — ${err ?? "Unknown"} (${Math.round(word.accuracy)})`
      : `${label} — ${err ?? "Unknown"}`;
  const cls =
    err === "Omission"
      ? "text-ut-dmg line-through"
      : err === "Insertion"
        ? "text-ut-fight italic"
        : err === "Mispronunciation"
          ? "text-ut-act"
          : "text-ut-mercy";
  return (
    <span title={tip} className={["font-dialog text-lg px-1", cls].join(" ")}>
      {label}
    </span>
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
