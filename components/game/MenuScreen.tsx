'use client';

import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuScreenProps {
  bestScore: number | null;
  onStart: () => void;
}

const HOW_TO_PLAY = [
  { icon: '🪙', label: '동전 +5', desc: '떨어지는 동전을 클릭' },
  { icon: '💵', label: '지폐 +15', desc: '더 높은 점수' },
  { icon: '🏅', label: '금괴 +50', desc: '최고 점수!' },
  { icon: '🫧', label: '비눗방울 -5/-20', desc: '터치하면 감점' },
  { icon: '⛽', label: '부스터', desc: '150점마다 충전 · 3초간 돈 폭발' },
];

export function MenuScreen({ bestScore, onStart }: MenuScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-4">
      {/* Title */}
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Casual Game</p>
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-b from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
          MAKE IT RAIN
        </h1>
        <p className="text-sm text-muted-foreground mt-1">💸 하늘에서 떨어지는 돈을 잡아라!</p>
      </div>

      {/* Best score */}
      {bestScore !== null ? (
        <div className="flex flex-col items-center gap-0.5 px-8 py-3 rounded-xl border border-amber-400/40 bg-amber-50/10">
          <span className="text-[10px] uppercase tracking-widest text-amber-500">🏆 최고 점수</span>
          <span className="text-3xl font-black text-amber-500">{bestScore.toLocaleString()}</span>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">최고 점수 -</div>
      )}

      <Button size="lg" onClick={onStart} className="px-10 text-base font-bold">
        <Play data-icon="inline-start" />
        시작
      </Button>

      {/* How to play */}
      <div className="w-full max-w-xs rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-3">How to play</p>
        {HOW_TO_PLAY.map(({ icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-2xl w-8 text-center leading-none">{icon}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[11px] text-muted-foreground">{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
