'use client';

import { Drop } from '@/components/game/Drop';
import type { Drop as DropType } from '@/types/game';

interface GameBoardProps {
  children?: React.ReactNode;
  countdown?: number | null;
  boosterActive?: boolean;
  drops?: DropType[];
  onClickDrop?: (id: string) => void;
}

export function GameBoard({ children, countdown, boosterActive, drops = [], onClickDrop }: GameBoardProps) {
  return (
    <div
      className={`relative overflow-hidden h-[480px] border rounded-lg bg-muted/10 ${
        boosterActive ? 'border-foreground ring-2 ring-ring' : 'border-dashed border-border'
      }`}
    >
      {boosterActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 border border-foreground rounded-full bg-background whitespace-nowrap tracking-wider z-10">
          ⚡ BOOSTER MODE
        </div>
      )}
      {countdown != null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span className="text-[120px] font-bold leading-none text-foreground/80">{countdown}</span>
        </div>
      )}
      {drops.map(drop => (
        <Drop key={drop.id} drop={drop} onClick={onClickDrop ?? (() => {})} />
      ))}
      {children}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground/40" />
    </div>
  );
}
