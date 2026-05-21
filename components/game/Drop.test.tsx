import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Drop } from './Drop';
import type { Drop as DropType } from '@/types/game';

function makeDrop(overrides: Partial<DropType> = {}): DropType {
  return {
    id: 'test-id',
    kind: 'coin',
    xPct: 50,
    yPx: 100,
    vyPxPerSec: 180,
    spawnedAt: 0,
    ...overrides,
  };
}

describe('Drop', () => {
  it('renders +5 label for coin', () => {
    render(<Drop drop={makeDrop({ kind: 'coin' })} onClick={() => {}} />);
    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('renders +15 label for bill', () => {
    render(<Drop drop={makeDrop({ kind: 'bill' })} onClick={() => {}} />);
    expect(screen.getByText('+15')).toBeInTheDocument();
  });

  it('renders +50 label for gold', () => {
    render(<Drop drop={makeDrop({ kind: 'gold' })} onClick={() => {}} />);
    expect(screen.getByText('+50')).toBeInTheDocument();
  });

  it('renders -5 label for bubble-s', () => {
    render(<Drop drop={makeDrop({ kind: 'bubble-s' })} onClick={() => {}} />);
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('renders -20 label for bubble-l', () => {
    render(<Drop drop={makeDrop({ kind: 'bubble-l' })} onClick={() => {}} />);
    expect(screen.getByText('-20')).toBeInTheDocument();
  });

  it('calls onClick with drop id when clicked', () => {
    const onClick = vi.fn();
    render(<Drop drop={makeDrop({ id: 'abc123', kind: 'coin' })} onClick={onClick} />);
    fireEvent.click(screen.getByText('+5'));
    expect(onClick).toHaveBeenCalledWith('abc123');
  });

  it('does not call onClick when dying', () => {
    const onClick = vi.fn();
    render(<Drop drop={makeDrop({ dying: true })} onClick={onClick} />);
    fireEvent.click(screen.getByText('+5'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is positioned at xPct% left and yPx top', () => {
    const { container } = render(
      <Drop drop={makeDrop({ xPct: 30, yPx: 120 })} onClick={() => {}} />,
    );
    // outer position wrapper
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.left).toBe('30%');
    expect(wrapper.style.top).toBe('120px');
  });

  it('hit area wrapper meets 44px minimum', () => {
    const { container } = render(<Drop drop={makeDrop()} onClick={() => {}} />);
    const hitWrapper = container.querySelector('.min-w-\\[44px\\]') as HTMLElement;
    expect(hitWrapper).toBeInTheDocument();
  });

  it('renders data-kind attribute on button', () => {
    render(<Drop drop={makeDrop({ kind: 'gold' })} onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-kind', 'gold');
  });
});
