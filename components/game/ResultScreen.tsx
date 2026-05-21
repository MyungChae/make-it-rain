'use client';

import type { GameStats } from '@/types/game';

interface ResultScreenProps {
  finalScore: number;
  stats: GameStats;
  isNewBest?: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

const STAT_LABELS: { key: keyof GameStats; label: string }[] = [
  { key: 'coin', label: '동전' },
  { key: 'bill', label: '지폐' },
  { key: 'gold', label: '금괴' },
  { key: 'bubble-s', label: '작은 비누방울' },
  { key: 'bubble-l', label: '큰 비누방울' },
];

export function ResultScreen({ finalScore, stats, isNewBest = false, onRestart, onMenu }: ResultScreenProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">결과</h1>

        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">최종 점수</p>
          <p className="text-5xl font-bold" data-testid="final-score">{finalScore}</p>
          {isNewBest && (
            <span
              data-testid="new-best-badge"
              className="inline-block mt-1 px-3 py-0.5 text-xs font-bold border border-foreground rounded-full"
            >
              ★ NEW BEST
            </span>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden text-sm">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key} className="flex justify-between px-4 py-2 even:bg-muted/30">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold" data-testid={`stat-${key}`}>{stats[key]}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-muted/50 transition-colors"
          >
            다시하기
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="flex-1 py-2 border border-border rounded-lg font-semibold hover:bg-muted/50 transition-colors"
          >
            메뉴로
          </button>
        </div>
      </div>
    </main>
  );
}
