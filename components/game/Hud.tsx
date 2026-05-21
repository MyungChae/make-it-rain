'use client';

import { Zap } from 'lucide-react';

interface HudProps {
  score: number;
  timeLeftSec: number;
  boosters?: number;
  boosterActive?: boolean;
  onBooster?: () => void;
}

export function Hud({ score, timeLeftSec, boosters = 0, boosterActive = false, onBooster }: HudProps) {
  const boosterDisabled = boosters === 0 || boosterActive;

  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground">SCORE</span>
        <span className="text-xl font-bold">{score}</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground">TIME</span>
        <span className="text-xl font-bold">{timeLeftSec}</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground">BOOSTER</span>
        <button
          type="button"
          onClick={onBooster}
          disabled={boosterDisabled}
          data-active={boosterActive ? '' : undefined}
          className="flex items-center gap-1 px-2 py-1 border border-border rounded text-xs data-[active]:ring-2 data-[active]:ring-ring disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Zap className="w-3 h-3" />
          <span>{boosterActive ? '활성중' : `× ${boosters}`}</span>
        </button>
      </div>
    </div>
  );
}
