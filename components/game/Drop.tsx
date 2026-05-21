'use client';

import React from 'react';
import type { Drop as DropType } from '@/types/game';

interface DropProps {
  drop: DropType;
  onClick: (id: string) => void;
}

const SHAPE: Record<DropType['kind'], string> = {
  coin: 'w-12 h-12 rounded-full border-2 border-yellow-500 bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100',
  bill: 'w-14 h-8 rounded border-2 border-green-500 bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100',
  gold: 'w-14 h-9 rounded-lg border-[3px] border-double border-amber-600 bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100',
  'bubble-s': 'w-9 h-9 rounded-full border-2 border-dashed border-sky-400 bg-sky-100/70 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  'bubble-l': 'w-14 h-14 rounded-full border-2 border-dashed border-violet-400 bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
};

const LABEL: Record<DropType['kind'], string> = {
  coin: '+5',
  bill: '+15',
  gold: '+50',
  'bubble-s': '-5',
  'bubble-l': '-20',
};

export const Drop = React.memo(function Drop({ drop, onClick }: DropProps) {
  const isBubble = drop.kind.startsWith('bubble');

  const handleClick = () => {
    if (drop.dying) return;
    onClick(drop.id);
  };

  return (
    <div
      className="absolute"
      style={{ left: `${drop.xPct}%`, top: `${drop.yPx}px` }}
    >
      {/* Invisible 44×44 min hit area wrapper satisfies mobile tap target rule */}
      <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
        <button
          type="button"
          onClick={handleClick}
          aria-label={drop.kind}
          data-testid={`drop-${drop.id}`}
          data-kind={drop.kind}
          className={[
            'flex items-center justify-center text-[10px] font-bold cursor-pointer select-none',
            'transition-all duration-150',
            drop.dying && isBubble ? 'scale-150 opacity-0' : drop.dying ? 'scale-75 opacity-0' : '',
            SHAPE[drop.kind],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {LABEL[drop.kind]}
        </button>
      </div>
    </div>
  );
});
