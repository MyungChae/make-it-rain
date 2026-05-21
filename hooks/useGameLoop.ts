'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  COUNTDOWN_SEC,
  ROUND_SEC,
  BOARD_HEIGHT,
  SCORES,
  BASE_SPAWN_INTERVAL_MS,
  MAX_SPEED_MULTIPLIER,
  BASE_FALL_PX_PER_SEC,
  BOOSTER_DURATION_MS,
} from '@/config/game';
import { pickKind, createDrop, spawnIntervalAt, fallSpeedAt } from '@/lib/spawner';
import { countCrossedThresholds } from '@/lib/score';
import type { Phase, Drop, GameStats } from '@/types/game';

const EMPTY_STATS: GameStats = { coin: 0, bill: 0, gold: 0, 'bubble-s': 0, 'bubble-l': 0 };

export function useGameLoop() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [score, setScore] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(ROUND_SEC);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [boosters, setBoosters] = useState(0);
  const [boosterActive, setBoosterActive] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalStats, setFinalStats] = useState<GameStats>({ ...EMPTY_STATS });

  // Refs — mutation without re-render during RAF
  const scoreRef = useRef(0);
  const dropsRef = useRef<Drop[]>([]);
  const statsRef = useRef<GameStats>({ ...EMPTY_STATS });
  const boostersRef = useRef(0);
  const lastBoosterThresholdRef = useRef(0);
  const boosterEndsAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roundStartRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);

  const resetRound = useCallback(() => {
    // Clear any pending drop-removal timeouts from previous round
    for (const t of pendingTimeoutsRef.current) clearTimeout(t);
    pendingTimeoutsRef.current = [];
    setScore(0);
    scoreRef.current = 0;
    setTimeLeftSec(ROUND_SEC);
    setDrops([]);
    dropsRef.current = [];
    statsRef.current = { ...EMPTY_STATS };
    setBoosters(0);
    boostersRef.current = 0;
    lastBoosterThresholdRef.current = 0;
    setBoosterActive(false);
    boosterEndsAtRef.current = null;
    setFinalScore(0);
    setFinalStats({ ...EMPTY_STATS });
  }, []);

  const start = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    resetRound();
    setPhase('countdown');
    setCountdown(COUNTDOWN_SEC);
  }, [resetRound]);

  const restart = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    resetRound();
    setPhase('countdown');
    setCountdown(COUNTDOWN_SEC);
  }, [resetRound]);

  const toMenu = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    resetRound();
    setPhase('menu');
  }, [resetRound]);

  // Countdown ticks
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

  // RAF game loop
  useEffect(() => {
    if (phase !== 'playing') return;

    const startTime = performance.now();
    roundStartRef.current = startTime;
    lastSpawnRef.current = startTime;
    lastFrameRef.current = startTime;

    function tick(now: number) {
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.1);
      lastFrameRef.current = now;

      const elapsedMs = now - roundStartRef.current;
      const elapsedSec = elapsedMs / 1000;
      const newTimeLeft = Math.max(0, ROUND_SEC - Math.floor(elapsedSec));

      if (newTimeLeft <= 0) {
        // Round over
        const fs = scoreRef.current;
        const fStats = { ...statsRef.current };
        dropsRef.current = [];
        setDrops([]);
        setTimeLeftSec(0);
        setFinalScore(fs);
        setFinalStats(fStats);
        boosterEndsAtRef.current = null;
        setBoosterActive(false);
        setPhase('result');
        return;
      }

      setTimeLeftSec(newTimeLeft);

      // Booster mode auto-expiry
      const isBoosterActive =
        boosterEndsAtRef.current !== null && now < boosterEndsAtRef.current;
      if (!isBoosterActive && boosterEndsAtRef.current !== null) {
        boosterEndsAtRef.current = null;
        setBoosterActive(false);
      }

      const spawnMode = isBoosterActive ? 'booster' : 'normal';
      const currentFallSpeed = fallSpeedAt(elapsedSec, BASE_FALL_PX_PER_SEC, MAX_SPEED_MULTIPLIER, ROUND_SEC);

      // Update positions + ground detection
      const aliveDrops: Drop[] = [];
      for (const d of dropsRef.current) {
        if (d.dying) {
          aliveDrops.push(d);
          continue;
        }
        const newY = d.yPx + currentFallSpeed * dt;
        if (newY >= BOARD_HEIGHT) {
          // Grounded — removed silently
        } else {
          aliveDrops.push({ ...d, yPx: newY });
        }
      }

      // Spawn new drop
      const currentInterval = spawnIntervalAt(elapsedSec, BASE_SPAWN_INTERVAL_MS, MAX_SPEED_MULTIPLIER, ROUND_SEC);
      if (now - lastSpawnRef.current >= currentInterval) {
        lastSpawnRef.current = now;
        const kind = pickKind(Math.random, spawnMode);
        const drop = createDrop(now, kind);
        aliveDrops.push(drop);
      }

      dropsRef.current = aliveDrops;
      setDrops([...aliveDrops]);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [phase]);

  const onClickDrop = useCallback((id: string) => {
    const drop = dropsRef.current.find(d => d.id === id);
    if (!drop || drop.dying) return;

    // Update score
    const delta = SCORES[drop.kind];
    const prevScore = scoreRef.current;
    const newScore = prevScore + delta;
    scoreRef.current = newScore;
    setScore(newScore);

    // Update stats
    statsRef.current[drop.kind]++;

    // Booster threshold check
    const { count, newLastThreshold } = countCrossedThresholds(
      prevScore,
      newScore,
      lastBoosterThresholdRef.current,
    );
    if (count > 0) {
      lastBoosterThresholdRef.current = newLastThreshold;
      boostersRef.current += count;
      setBoosters(boostersRef.current);
    }

    // Mark dying
    dropsRef.current = dropsRef.current.map(d =>
      d.id === id ? { ...d, dying: true } : d,
    );
    setDrops([...dropsRef.current]);

    // Remove after animation
    const delay = drop.kind.startsWith('bubble') ? 200 : 150;
    const t = setTimeout(() => {
      dropsRef.current = dropsRef.current.filter(d => d.id !== id);
      setDrops([...dropsRef.current]);
    }, delay);
    pendingTimeoutsRef.current.push(t);
  }, []);

  const activateBooster = useCallback(() => {
    // Guard: no boosters or already active
    if (boostersRef.current <= 0 || boosterEndsAtRef.current !== null) return;

    boostersRef.current -= 1;
    setBoosters(boostersRef.current);
    const endsAt = performance.now() + BOOSTER_DURATION_MS;
    boosterEndsAtRef.current = endsAt;
    setBoosterActive(true);
  }, []);

  return {
    phase,
    score,
    timeLeftSec,
    countdown,
    drops,
    boosters,
    boosterActive,
    finalScore,
    finalStats,
    start,
    restart,
    toMenu,
    onClickDrop,
    activateBooster,
  };
}
