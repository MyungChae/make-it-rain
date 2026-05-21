import { BEST_SCORE_KEY } from '@/config/game';

export function getBestScore(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(BEST_SCORE_KEY);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function setBestScore(score: number): void {
  if (typeof window === 'undefined') return;
  if (!Number.isFinite(score) || score <= 0) return;
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}
