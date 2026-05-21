import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ResultScreen } from './ResultScreen';
import type { GameStats } from '@/types/game';

const EMPTY_STATS: GameStats = { coin: 0, bill: 0, gold: 0, 'bubble-s': 0, 'bubble-l': 0 };

describe('ResultScreen', () => {
  it('shows final score', () => {
    render(
      <ResultScreen finalScore={120} stats={EMPTY_STATS} onRestart={() => {}} onMenu={() => {}} />,
    );
    expect(screen.getByTestId('final-score')).toHaveTextContent('120');
  });

  it('shows all 5 stat categories', () => {
    render(
      <ResultScreen finalScore={0} stats={EMPTY_STATS} onRestart={() => {}} onMenu={() => {}} />,
    );
    expect(screen.getByTestId('stat-coin')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bill')).toBeInTheDocument();
    expect(screen.getByTestId('stat-gold')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bubble-s')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bubble-l')).toBeInTheDocument();
  });

  it('shows stat values', () => {
    const stats: GameStats = { coin: 3, bill: 2, gold: 1, 'bubble-s': 4, 'bubble-l': 0 };
    render(<ResultScreen finalScore={0} stats={stats} onRestart={() => {}} onMenu={() => {}} />);
    expect(screen.getByTestId('stat-coin')).toHaveTextContent('3');
    expect(screen.getByTestId('stat-bill')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-gold')).toHaveTextContent('1');
  });

  it('shows NEW BEST badge when isNewBest=true', () => {
    render(
      <ResultScreen finalScore={120} stats={EMPTY_STATS} isNewBest={true} onRestart={() => {}} onMenu={() => {}} />,
    );
    expect(screen.getByTestId('new-best-badge')).toBeInTheDocument();
  });

  it('hides NEW BEST badge when isNewBest=false (default)', () => {
    render(
      <ResultScreen finalScore={80} stats={EMPTY_STATS} onRestart={() => {}} onMenu={() => {}} />,
    );
    expect(screen.queryByTestId('new-best-badge')).toBeNull();
  });

  it('calls onRestart when 다시하기 button is clicked', () => {
    const onRestart = vi.fn();
    render(
      <ResultScreen finalScore={0} stats={EMPTY_STATS} onRestart={onRestart} onMenu={() => {}} />,
    );
    fireEvent.click(screen.getByText('다시하기'));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('calls onMenu when 메뉴로 button is clicked', () => {
    const onMenu = vi.fn();
    render(
      <ResultScreen finalScore={0} stats={EMPTY_STATS} onRestart={() => {}} onMenu={onMenu} />,
    );
    fireEvent.click(screen.getByText('메뉴로'));
    expect(onMenu).toHaveBeenCalledOnce();
  });
});
