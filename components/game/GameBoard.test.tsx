import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameBoard } from './GameBoard';

describe('GameBoard', () => {
  it('shows countdown number when provided', () => {
    render(<GameBoard countdown={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows countdown=1', () => {
    render(<GameBoard countdown={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('hides countdown overlay when null', () => {
    const { container } = render(<GameBoard countdown={null} />);
    // no big number overlay
    expect(screen.queryByText('3')).toBeNull();
    expect(container.querySelector('[data-countdown]')).toBeNull();
  });

  it('hides countdown overlay when undefined', () => {
    render(<GameBoard />);
    expect(screen.queryByText('3')).toBeNull();
  });

  it('renders children', () => {
    render(<GameBoard><div data-testid="drop">drop</div></GameBoard>);
    expect(screen.getByTestId('drop')).toBeInTheDocument();
  });
});
