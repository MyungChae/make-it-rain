'use client';

import React from 'react';
import type { Drop as DropType } from '@/types/game';

interface DropProps {
  drop: DropType;
  onClick: (id: string) => void;
}

// Emoji + wrapper size per kind
const VISUAL: Record<DropType['kind'], { emoji: string; cls: string; shadow: string }> = {
  coin: {
    emoji: '🪙',
    cls: 'w-16 h-16 rounded-full text-5xl',
    shadow: 'drop-shadow-[0_2px_6px_rgba(202,138,4,0.7)]',
  },
  bill: {
    emoji: '💵',
    cls: 'w-20 h-12 rounded-md text-4xl',
    shadow: 'drop-shadow-[0_2px_6px_rgba(22,163,74,0.6)]',
  },
  gold: {
    emoji: '🏅',
    cls: 'w-16 h-16 rounded-lg text-5xl',
    shadow: 'drop-shadow-[0_2px_8px_rgba(217,119,6,0.8)]',
  },
  'bubble-s': {
    emoji: '🫧',
    cls: 'w-10 h-10 rounded-full text-3xl',
    shadow: 'drop-shadow-[0_1px_4px_rgba(56,189,248,0.5)]',
  },
  'bubble-l': {
    emoji: '🫧',
    cls: 'w-16 h-16 rounded-full text-5xl',
    shadow: 'drop-shadow-[0_2px_6px_rgba(139,92,246,0.5)]',
  },
};

const SCORE_BADGE: Record<DropType['kind'], string> = {
  coin: '+5',
  bill: '+15',
  gold: '+50',
  'bubble-s': '-5',
  'bubble-l': '-20',
};

const BADGE_COLOR: Record<DropType['kind'], string> = {
  coin: 'bg-yellow-400 text-yellow-900',
  bill: 'bg-green-400 text-green-900',
  gold: 'bg-amber-500 text-white',
  'bubble-s': 'bg-sky-300 text-sky-900',
  'bubble-l': 'bg-violet-400 text-white',
};

export const Drop = React.memo(function Drop({ drop, onClick }: DropProps) {
  const isBubble = drop.kind.startsWith('bubble');
  const { emoji, cls, shadow } = VISUAL[drop.kind];

  const handleClick = () => {
    if (drop.dying) return;
    onClick(drop.id);
  };

  const dyingCls = drop.dying
    ? isBubble
      ? 'scale-150 opacity-0'
      : 'scale-75 opacity-0'
    : '';

  return (
    <div
      className="absolute"
      style={{ left: `${drop.xPct}%`, top: `${drop.yPx}px` }}
    >
      {/* 44×44 min tap area */}
      <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
        <button
          type="button"
          onClick={handleClick}
          aria-label={drop.kind}
          data-testid={`drop-${drop.id}`}
          data-kind={drop.kind}
          className={[
            'relative flex items-center justify-center cursor-pointer select-none',
            'transition-all duration-150 active:scale-90',
            shadow,
            cls,
            dyingCls,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="leading-none">{emoji}</span>
          {/* Score badge */}
          <span
            className={[
              'absolute -bottom-1 -right-1 text-[9px] font-black leading-none px-1 py-0.5 rounded-full',
              BADGE_COLOR[drop.kind],
            ].join(' ')}
          >
            {SCORE_BADGE[drop.kind]}
          </span>
        </button>
      </div>
    </div>
  );
});
