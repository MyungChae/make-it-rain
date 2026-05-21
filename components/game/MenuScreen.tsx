'use client';

import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';

interface MenuScreenProps {
  bestScore: number | null;
  onStart: () => void;
}

export function MenuScreen({ bestScore, onStart }: MenuScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 px-4">
      <div className="text-center">
        <div className="text-xs mb-2 text-muted-foreground uppercase tracking-wider">CASUAL GAME</div>
        <h1 className="text-4xl font-bold tracking-wider">MAKE IT RAIN</h1>
        <p className="text-sm mt-3 text-muted-foreground">하늘에서 떨어지는 돈을 잡아라</p>
      </div>

      {bestScore !== null ? (
        <Card className="px-6">
          <CardHeader className="pb-1 pt-4">
            <CardDescription className="uppercase tracking-wider text-center text-xs">최고 점수</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold text-center">{bestScore.toLocaleString()}</div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm text-muted-foreground">최고 점수 -</div>
      )}

      <Button size="lg" onClick={onStart}>
        <Play data-icon="inline-start" />
        시작
      </Button>

      <p className="text-xs text-center max-w-xs leading-relaxed text-muted-foreground">
        60초 동안 떨어지는 돈을 클릭해 점수를 모으세요.<br />
        비누방울을 잘못 누르면 점수가 깎입니다.
      </p>
    </div>
  );
}
