"use client";

import { GameProvider, useGame } from "@/lib/game-state";
import TitleScreen from "@/components/TitleScreen";
import IntroScreen from "@/components/IntroScreen";
import Overworld from "@/components/Overworld";
import Encounter from "@/components/Encounter";
import EndingScreen from "@/components/EndingScreen";
import GameOverScreen from "@/components/GameOverScreen";
import CharacterPane from "@/components/CharacterPane";

function GameRouter() {
  const { state } = useGame();

  const sceneNode = (() => {
    switch (state.scene) {
      case "title":
        return <TitleScreen />;
      case "intro":
        return <IntroScreen />;
      case "overworld":
        return <Overworld />;
      case "encounter":
        return <Encounter />;
      case "ending":
        return <EndingScreen />;
      case "gameover":
        return <GameOverScreen />;
      default:
        return <TitleScreen />;
    }
  })();

  const withPane =
    state.scene === "overworld" || state.scene === "encounter";

  if (!withPane) return sceneNode;

  return (
    <div className="absolute inset-0 flex">
      <CharacterPane />
      <div className="relative flex-1">{sceneNode}</div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black">
      <GameProvider>
        <div
          className="relative w-full max-w-[960px] aspect-[16/10] bg-ut-black border-4 border-white overflow-hidden scanlines"
          style={{ boxShadow: "0 0 60px rgba(255,255,255,0.06)" }}
        >
          <GameRouter />
        </div>
      </GameProvider>
    </main>
  );
}
