'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBestScore, setBestScore } from '@/lib/storage';

export function useBestScore() {
  const [bestScore, setBestScoreState] = useState<number | null>(null);

  useEffect(() => {
    setBestScoreState(getBestScore());
  }, []);

  const recordIfBest = useCallback((score: number): { isNewBest: boolean; updatedBest: number } => {
    const current = getBestScore();
    if (score <= 0) {
      return { isNewBest: false, updatedBest: current ?? 0 };
    }
    if (current === null || score > current) {
      setBestScore(score);
      setBestScoreState(score);
      return { isNewBest: true, updatedBest: score };
    }
    return { isNewBest: false, updatedBest: current };
  }, []);

  return { bestScore, recordIfBest };
}
