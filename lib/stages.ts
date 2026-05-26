import type { CharacterId, Item, Stage } from "./types";

export const CHARACTERS: Record<CharacterId, { sprite: string }> = {
  default: { sprite: "/sprites/main_character.png" },
  girl: { sprite: "/sprites/main_character_girl.png" },
};

export const CHARACTER_ORDER: CharacterId[] = ["default", "girl"];

export const ITEMS: Record<string, Item> = {
  purification_tablet: {
    id: "purification_tablet",
    name: "PURIFY TAB",
    icon: "✚",
    blurb: "Turns salty puddle into drinkable water.",
  },
  tarp: {
    id: "tarp",
    name: "TARP",
    icon: "▲",
    blurb: "A torn sheet of canvas. Better than nothing.",
  },
  fire_steel: {
    id: "fire_steel",
    name: "FIRE STEEL",
    icon: "✦",
    blurb: "Strike to summon a tiny dancing flame.",
  },
  fishing_rod: {
    id: "fishing_rod",
    name: "FISHING ROD",
    icon: "ϟ",
    blurb: "A bent stick with vine for line. Heroic.",
  },
  first_aid_kit: {
    id: "first_aid_kit",
    name: "FIRST AID",
    icon: "✚",
    blurb: "Half-empty, but lifesaving.",
  },
  signal_flare: {
    id: "signal_flare",
    name: "SIGNAL FLARE",
    icon: "★",
    blurb: "One flare. One chance.",
  },
};

export const STAGES: Stage[] = [
  {
    id: 1,
    slug: "awakening",
    title: "STAGE 1 — AWAKE",
    subtitle: "You open your eyes on the sand.",
    watchLine:
      "* SmartWatch: Vitals critical. Speak to confirm consciousness. Water and shelter required.",
    innerVoice: "* The sun is a hammer. My throat is a dry well.",
    reward: ["purification_tablet", "tarp"],
    damageOnFail: 12,
    biome: "beach",
    nodePosition: { x: 18, y: 70 },
    missions: [
      {
        prompt: "Call out — is anyone on this beach?",
        target: "Is anybody there?",
        hint: "Three words. Asking presence.",
        timeLimitMs: 9000,
      },
      {
        prompt: "Describe your state to the watch.",
        target: "I'm so thirsty.",
        hint: "State of need. Use a contraction.",
        timeLimitMs: 9000,
      },
    ],
  },
  {
    id: 2,
    slug: "spark",
    title: "STAGE 2 — SPARK",
    subtitle: "Night falls. Something is growling in the trees.",
    watchLine:
      "* SmartWatch: Body temperature dropping. Recite the fire-making procedure aloud.",
    innerVoice: "* Hands shaking. The dark is hungry tonight.",
    reward: ["fire_steel", "fishing_rod"],
    damageOnFail: 16,
    biome: "forest",
    nodePosition: { x: 40, y: 48 },
    missions: [
      {
        prompt: "Tell yourself how to start a fire.",
        target: "How to make a fire.",
        hint: "Instructional. Five words.",
        timeLimitMs: 10000,
      },
      {
        prompt: "Narrate your plan for breakfast.",
        target: "I am catching a fish.",
        hint: "Present continuous.",
        timeLimitMs: 10000,
      },
    ],
  },
  {
    id: 3,
    slug: "venom",
    title: "STAGE 3 — VENOM",
    subtitle: "A black thorn snaps off in your calf. It burns.",
    watchLine:
      "* SmartWatch: Toxin detected. Verbalize symptoms and request remedy.",
    innerVoice: "* It pulses. Hot. White. Hot. White. Talk. Stay awake.",
    reward: ["first_aid_kit"],
    damageOnFail: 20,
    biome: "ravine",
    nodePosition: { x: 64, y: 58 },
    missions: [
      {
        prompt: "Report your injury to the watch.",
        target: "My leg hurts.",
        hint: "Body + verb.",
        timeLimitMs: 8000,
      },
      {
        prompt: "Ask for the cure.",
        target: "I need an antidote.",
        hint: "Need + noun.",
        timeLimitMs: 9000,
      },
    ],
  },
  {
    id: 4,
    slug: "horizon",
    title: "STAGE 4 — HORIZON",
    subtitle: "A ship cuts the horizon. Maybe the last one.",
    watchLine:
      "* SmartWatch: Vessel detected at 2 o'clock. Last flare on standby. Speak loud.",
    innerVoice: "* This is it. This is it. This is it.",
    reward: ["signal_flare"],
    damageOnFail: 25,
    biome: "cliff",
    nodePosition: { x: 84, y: 28 },
    missions: [
      {
        prompt: "Wave your arms and shout.",
        target: "Look over here!",
        hint: "Imperative + direction.",
        timeLimitMs: 7000,
      },
      {
        prompt: "Send the distress call.",
        target: "S O S send help!",
        hint: "Three letters + plea.",
        timeLimitMs: 8000,
      },
    ],
  },
];
