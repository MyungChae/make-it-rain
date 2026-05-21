'use client';

import { useState, useEffect, useCallback } from 'react';
import { COUNTDOWN_SEC, ROUND_SEC } from '@/config/game';
import type { Phase } from '@/types/game';

export function useGameLoop() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [score, setScore] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(ROUND_SEC);
  const [countdown, setCountdown] = useState<number | null>(null);

  const start = useCallback(() => {
    setPhase('countdown');
    setScore(0);
    setTimeLeftSec(ROUND_SEC);
    setCountdown(COUNTDOWN_SEC);
  }, []);

  useEffect(() => {
    if (phase !== 'countdown' || countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null);
        setPhase('playing');
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  return { phase, score, timeLeftSec, countdown, start };
}
