"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { STAGES } from "./stages";
import type { CharacterId, EndingKind, GameState, ItemId, Scene } from "./types";

type Action =
  | { type: "RESET" }
  | { type: "GOTO"; scene: Scene }
  | { type: "ENTER_STAGE"; stageId: number }
  | { type: "DAMAGE"; amount: number }
  | { type: "HEAL"; amount: number }
  | { type: "CLEAR_STAGE"; stageId: number; rewards: ItemId[] }
  | { type: "FORCE_END"; kind: EndingKind }
  | { type: "SET_NAME"; name: string }
  | { type: "SET_CHARACTER"; character: CharacterId };

const INITIAL: GameState = {
  scene: "title",
  hp: 100,
  maxHp: 100,
  currentStageId: null,
  clearedStages: [],
  inventory: [],
  endingKind: null,
  playerName: "",
  character: "default",
};

function endingFor(hp: number, items: number, total: number): EndingKind {
  if (hp <= 0) return "gameover";
  if (items === total && hp >= 70) return "perfect";
  if (items === total) return "barely";
  return "chief";
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESET":
      return { ...INITIAL };
    case "GOTO":
      return { ...state, scene: action.scene };
    case "ENTER_STAGE":
      return { ...state, scene: "encounter", currentStageId: action.stageId };
    case "DAMAGE": {
      const hp = Math.max(0, state.hp - action.amount);
      if (hp <= 0) {
        return { ...state, hp: 0, scene: "gameover", endingKind: "gameover" };
      }
      return { ...state, hp };
    }
    case "HEAL":
      return { ...state, hp: Math.min(state.maxHp, state.hp + action.amount) };
    case "CLEAR_STAGE": {
      const cleared = state.clearedStages.includes(action.stageId)
        ? state.clearedStages
        : [...state.clearedStages, action.stageId];
      const inv = Array.from(new Set([...state.inventory, ...action.rewards]));
      const allDone = cleared.length === STAGES.length;
      if (allDone) {
        const totalRewards = STAGES.flatMap((s) => s.reward).length;
        const kind = endingFor(state.hp, inv.length, totalRewards);
        return {
          ...state,
          clearedStages: cleared,
          inventory: inv,
          currentStageId: null,
          scene: "ending",
          endingKind: kind,
        };
      }
      return {
        ...state,
        clearedStages: cleared,
        inventory: inv,
        currentStageId: null,
        scene: "overworld",
      };
    }
    case "FORCE_END":
      return {
        ...state,
        scene: action.kind === "gameover" ? "gameover" : "ending",
        endingKind: action.kind,
      };
    case "SET_NAME":
      return { ...state, playerName: action.name.slice(0, 12) };
    case "SET_CHARACTER":
      return { ...state, character: action.character };
    default:
      return state;
  }
}

type Ctx = {
  state: GameState;
  reset: () => void;
  goto: (scene: Scene) => void;
  enterStage: (stageId: number) => void;
  damage: (amount: number) => void;
  heal: (amount: number) => void;
  clearStage: (stageId: number, rewards: ItemId[]) => void;
  setPlayerName: (name: string) => void;
  setCharacter: (character: CharacterId) => void;
};

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const value = useMemo<Ctx>(
    () => ({
      state,
      reset: () => dispatch({ type: "RESET" }),
      goto: (scene) => dispatch({ type: "GOTO", scene }),
      enterStage: (stageId) => dispatch({ type: "ENTER_STAGE", stageId }),
      damage: (amount) => dispatch({ type: "DAMAGE", amount }),
      heal: (amount) => dispatch({ type: "HEAL", amount }),
      clearStage: (stageId, rewards) =>
        dispatch({ type: "CLEAR_STAGE", stageId, rewards }),
      setPlayerName: (name) => dispatch({ type: "SET_NAME", name }),
      setCharacter: (character) => dispatch({ type: "SET_CHARACTER", character }),
    }),
    [state],
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

export function useStableCallback<T extends (...args: never[]) => unknown>(
  fn: T,
) {
  return useCallback(fn, [fn]);
}
