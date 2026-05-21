import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameLoop } from './useGameLoop';

describe('useGameLoop — Task 2: countdown + HUD skeleton', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('starts in menu phase with null countdown', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(result.current.phase).toBe('menu');
    expect(result.current.countdown).toBeNull();
  });

  it('transitions to countdown=3 after start()', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    expect(result.current.phase).toBe('countdown');
    expect(result.current.countdown).toBe(3);
  });

  it('SC1: menu disappears, countdown "3" shown after start()', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    expect(result.current.phase).toBe('countdown');
    expect(result.current.countdown).toBe(3);
  });

  it('SC2: counts 3 → 2 → 1 at 1s intervals', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdown).toBe(2);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdown).toBe(1);
  });

  it('SC3/SC4: transitions to playing with countdown=null at 3s', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); }); // 3→2
    act(() => { vi.advanceTimersByTime(1000); }); // 2→1
    act(() => { vi.advanceTimersByTime(1000); }); // 1→playing
    expect(result.current.phase).toBe('playing');
    expect(result.current.countdown).toBeNull();
  });

  it('SC3: shows score=0 and timeLeftSec=60 after countdown', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.score).toBe(0);
    expect(result.current.timeLeftSec).toBe(60);
  });
});

describe('useGameLoop — Task 3: drops + scoring', () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.useRealTimers(); });

  it('drops starts as empty array', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(result.current.drops).toEqual([]);
  });

  it('exposes onClickDrop function', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(typeof result.current.onClickDrop).toBe('function');
  });

  it('onClickDrop with unknown id does not change score', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.onClickDrop('non-existent'); });
    expect(result.current.score).toBe(0);
  });

  it('score starts at 0', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(result.current.score).toBe(0);
  });

  it('restart() resets score to 0', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(3000); }); // through countdown
    // Manually test restart resets state
    act(() => { result.current.restart(); });
    expect(result.current.score).toBe(0);
    expect(result.current.timeLeftSec).toBe(60);
    expect(result.current.drops).toEqual([]);
  });

  it('toMenu() brings phase back to menu', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { result.current.toMenu(); });
    expect(result.current.phase).toBe('menu');
  });
});

describe('useGameLoop — Task 5: best score + restart + menu', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('restart() starts new countdown from result phase', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { result.current.restart(); });
    expect(result.current.phase).toBe('countdown');
    expect(result.current.countdown).toBe(3);
    expect(result.current.score).toBe(0);
    expect(result.current.timeLeftSec).toBe(60);
  });

  it('toMenu() resets all state and goes to menu', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { result.current.toMenu(); });
    expect(result.current.phase).toBe('menu');
    expect(result.current.score).toBe(0);
    expect(result.current.drops).toEqual([]);
  });
});

describe('useGameLoop — Task 6: booster charging', () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.useRealTimers(); });

  it('boosters starts at 0', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(result.current.boosters).toBe(0);
  });

  it('restart() resets boosters to 0', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.restart(); });
    expect(result.current.boosters).toBe(0);
  });
});

describe('useGameLoop — Task 7: booster activation', () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.useRealTimers(); });

  it('boosterActive starts false', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(result.current.boosterActive).toBe(false);
  });

  it('activateBooster does nothing when boosters=0', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.activateBooster(); });
    expect(result.current.boosterActive).toBe(false);
  });
});
