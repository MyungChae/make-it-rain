'use client';

import { MenuScreen } from '@/components/game/MenuScreen';
import { Hud } from '@/components/game/Hud';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useBestScore } from '@/hooks/useBestScore';

export default function Page() {
  const { bestScore } = useBestScore();
  const { phase, score, timeLeftSec, countdown, start } = useGameLoop();

  if (phase === 'menu') {
    return (
      <main className="min-h-screen">
        <MenuScreen bestScore={bestScore} onStart={start} />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 max-w-2xl mx-auto">
      <Hud score={score} timeLeftSec={timeLeftSec} />
      <GameBoard countdown={countdown} />
    </main>
  );
}
