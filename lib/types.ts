export type Scene =
  | "title"
  | "intro"
  | "overworld"
  | "encounter"
  | "diary"
  | "ending"
  | "gameover";

export type ItemId =
  | "purification_tablet"
  | "tarp"
  | "fire_steel"
  | "fishing_rod"
  | "first_aid_kit"
  | "signal_flare";

export type Item = {
  id: ItemId;
  name: string;
  icon: string;
  blurb: string;
};

export type SpeakingMission = {
  prompt: string;
  target: string;
  hint: string;
  timeLimitMs: number;
};

export type Stage = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  watchLine: string;
  innerVoice: string;
  reward: ItemId[];
  missions: SpeakingMission[];
  damageOnFail: number;
  biome: "beach" | "forest" | "ravine" | "cliff";
  nodePosition: { x: number; y: number };
};

export type EndingKind = "perfect" | "barely" | "chief" | "gameover";

export type CharacterId = "default" | "girl";

export type GameState = {
  scene: Scene;
  hp: number;
  maxHp: number;
  currentStageId: number | null;
  clearedStages: number[];
  inventory: ItemId[];
  endingKind: EndingKind | null;
  playerName: string;
  character: CharacterId;
};
