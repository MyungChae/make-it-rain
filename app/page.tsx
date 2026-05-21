'use client';

import { useState, useEffect } from 'react';
import { MenuScreen } from '@/components/game/MenuScreen';
import { Hud } from '@/components/game/Hud';
import { GameBoard } from '@/components/game/GameBoard';
import { ResultScreen } from '@/components/game/ResultScreen';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useBestScore } from '@/hooks/useBestScore';

export default function Page() {
  const { bestScore, recordIfBest } = useBestScore();
  const [isNewBest, setIsNewBest] = useState(false);
  const {
    phase,
    score,
    timeLeftSec,
    countdown,
    drops,
    boosters,
    boosterActive,
    finalScore,
    finalStats,
    start,
    restart,
    toMenu,
    onClickDrop,
    activateBooster,
  } = useGameLoop();

  // Record best score when transitioning to result
  useEffect(() => {
    if (phase === 'result') {
      const { isNewBest: newBest } = recordIfBest(finalScore);
      setIsNewBest(newBest);
    }
  }, [phase, finalScore, recordIfBest]);

  const handleRestart = () => {
    setIsNewBest(false);
    restart();
  };

  const handleMenu = () => {
    setIsNewBest(false);
    toMenu();
  };

  if (phase === 'menu') {
    return (
      <main className="min-h-screen">
        <MenuScreen bestScore={bestScore} onStart={start} />
      </main>
    );
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        finalScore={finalScore}
        stats={finalStats}
        isNewBest={isNewBest}
        onRestart={handleRestart}
        onMenu={handleMenu}
      />
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 max-w-2xl mx-auto">
      <Hud
        score={score}
        timeLeftSec={timeLeftSec}
        boosters={boosters}
        boosterActive={boosterActive}
        onBooster={activateBooster}
      />
      <GameBoard
        countdown={countdown}
        boosterActive={boosterActive}
        drops={drops}
        onClickDrop={onClickDrop}
      />
    </main>
  );
}
