import type { CharacterId, Item, ItemId, Stage } from "./types";

export const CHARACTERS: Record<CharacterId, { sprite: string }> = {
  default: { sprite: "/sprites/main_character.png" },
  girl: { sprite: "/sprites/main_character_girl.png" },
};

export const CHARACTER_ORDER: CharacterId[] = ["default", "girl"];

export const ITEMS: Record<ItemId, Item> = {
  fish: {
    id: "fish",
    name: "FISH",
    sprite: "/sprites/fish.png",
    blurb: "A flopping silver catch. Dinner, at last.",
  },
  knife: {
    id: "knife",
    name: "KNIFE",
    sprite: "/sprites/knife.png",
    blurb: "A salvaged blade. Sharp enough to matter.",
  },
  clothes: {
    id: "clothes",
    name: "CLOTHES",
    sprite: "/sprites/clothes.png",
    blurb: "Dry rags against the biting night.",
  },
  boat: {
    id: "boat",
    name: "BOAT",
    sprite: "/sprites/boat.png",
    blurb: "A patched hull. Maybe it floats. Maybe.",
  },
};

export const STAGES: Stage[] = [
  {
    id: 1,
    slug: "awakening",
    title: "STAGE 1 — WAKE UP",
    subtitle: "You open your eyes on the sand.",
    watchLine:
      "* SmartWatch: Vitals critical. Speak to confirm consciousness. Water and shelter required.",
    innerVoice: "* The sun is a hammer. My throat is a dry well.",
    reward: ["fish"],
    damageOnFail: 12,
    biome: "beach",
    nodePosition: { x: 18, y: 70 },
    missions: [
      {
        prompt: "Call out — is anyone on this beach?",
        target: "Where am I?",
        hint: "Three words. Asking presence.",
        timeLimitMs: 9000,
      },
      {
        prompt: "Describe your state to the watch.",
        target: "I am hungry.",
        hint: "State of need. Use a contraction.",
        timeLimitMs: 9000,
      },
      {
        prompt: "Describe your state to the watch.",
        target: "Where is my food?",
        hint: "State of need. Use a contraction.",
        timeLimitMs: 9000,
      },
    ],
  },
  {
    id: 2,
    slug: "spark",
    title: "STAGE 2 — HUNT",
    subtitle: "Night falls. Something is growling in the trees.",
    watchLine:
      "* SmartWatch: Body temperature dropping. Recite the fire-making procedure aloud.",
    innerVoice: "* Hands shaking. The dark is hungry tonight.",
    reward: ["knife"],
    damageOnFail: 16,
    biome: "forest",
    nodePosition: { x: 40, y: 48 },
    missions: [
      {
        prompt: "Tell yourself how to start a fire.",
        target: "It's a lion!",
        hint: "Instructional. Five words.",
        timeLimitMs: 10000,
      },
      {
        prompt: "Narrate your plan for breakfast.",
        target: "I need to fight.",
        hint: "Present continuous.",
        timeLimitMs: 10000,
      },
    ],
  },
  {
    id: 3,
    slug: "venom",
    title: "STAGE 3 — DANGER",
    subtitle: "A black thorn snaps off in your calf. It burns.",
    watchLine:
      "* SmartWatch: Toxin detected. Verbalize symptoms and request remedy.",
    innerVoice: "* It pulses. Hot. White. Hot. White. Talk. Stay awake.",
    reward: ["clothes"],
    damageOnFail: 20,
    biome: "ravine",
    nodePosition: { x: 64, y: 58 },
    missions: [
      {
        prompt: "Report your injury to the watch.",
        target: "I'm so cold. I need clothes.",
        hint: "Body + verb.",
        timeLimitMs: 8000,
      },
      {
        prompt: "Ask for the cure.",
        target: "It will help me",
        hint: "Need + noun.",
        timeLimitMs: 9000,
      },
    ],
  },
  {
    id: 4,
    slug: "horizon",
    title: "STAGE 4 — GO HOME",
    subtitle: "A ship cuts the horizon. Maybe the last one.",
    watchLine:
      "* SmartWatch: Vessel detected at 2 o'clock. Last flare on standby. Speak loud.",
    innerVoice: "* This is it. This is it. This is it.",
    reward: ["boat"],
    damageOnFail: 25,
    biome: "cliff",
    nodePosition: { x: 84, y: 28 },
    missions: [
      {
        prompt: "Wave your arms and shout.",
        target: "Now, everything is ready!",
        hint: "Imperative + direction.",
        timeLimitMs: 7000,
      },
      {
        prompt: "Send the distress call.",
        target: "Let's go home!",
        hint: "Three letters + plea.",
        timeLimitMs: 8000,
      },
    ],
  },
];
