'use client';

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
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">BOOSTER</span>
          <span
            className="text-[9px] text-muted-foreground/60 hidden sm:inline"
            title="누르면 3초간 돈 폭발!"
          >
            ·3초간 돈 폭발
          </span>
        </div>
        <button
          type="button"
          onClick={onBooster}
          disabled={boosterDisabled}
          data-active={boosterActive ? '' : undefined}
          title="누르면 3초간 돈이 더 많이 떨어집니다!"
          className="flex items-center gap-1 px-2 py-1 border border-border rounded text-xs data-[active]:ring-2 data-[active]:ring-ring data-[active]:border-orange-400 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">⛽</span>
          <span className={boosterActive ? 'text-orange-400 font-bold' : ''}>
            {boosterActive ? '⚡ 활성중!' : `× ${boosters}`}
          </span>
        </button>
        <span className="text-[9px] text-muted-foreground/50 sm:hidden">누르면 3초간 돈 폭발</span>
      </div>
    </div>
  );
}
