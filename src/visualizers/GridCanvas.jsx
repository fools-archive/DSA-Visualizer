import { useMemo } from 'react';
import { cellKey, isWall } from '../algorithms/grid/sampleGrid.js';

// Reduces a [0..index] slice of the step stream into a per-cell state map:
//   'frontier' | 'visited' | 'path' | undefined
// Walls, start and end are pulled from the grid value itself.

function reduce(grid, steps, index) {
  const state = new Map();
  const end = Math.max(0, Math.min(index, steps.length));
  for (let i = 0; i < end; i++) {
    const s = steps[i];
    if (s.type === 'grid-frontier') state.set(cellKey(s.r, s.c), 'frontier');
    else if (s.type === 'grid-visit') state.set(cellKey(s.r, s.c), 'visited');
    else if (s.type === 'grid-path') state.set(cellKey(s.r, s.c), 'path');
  }
  return state;
}

export default function GridCanvas({ grid, steps, index, onToggleWall }) {
  const state = useMemo(() => reduce(grid, steps, index), [grid, steps, index]);
  const cell = 26;
  const pad = 8;
  const w = grid.cols * cell + pad * 2;
  const h = grid.rows * cell + pad * 2;

  const fillFor = (r, c) => {
    if (grid.start[0] === r && grid.start[1] === c) return 'var(--accent)';
    if (grid.end[0] === r && grid.end[1] === c) return 'var(--accent)';
    if (isWall(grid, r, c)) return 'var(--ink-2)';
    const s = state.get(cellKey(r, c));
    if (s === 'path') return 'var(--accent)';
    if (s === 'visited') return 'var(--state-visited)';
    if (s === 'frontier') return 'var(--state-frontier)';
    return 'var(--paper-2)';
  };

  const cells = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const isEndpoint = (grid.start[0] === r && grid.start[1] === c) ||
        (grid.end[0] === r && grid.end[1] === c);
      cells.push(
        <rect
          key={`${r},${c}`}
          x={pad + c * cell}
          y={pad + r * cell}
          width={cell - 1}
          height={cell - 1}
          fill={fillFor(r, c)}
          stroke="var(--rule)"
          strokeWidth={0.5}
          opacity={isEndpoint ? 0.95 : 1}
          style={{ cursor: onToggleWall ? 'pointer' : 'default', transition: 'fill 160ms ease-out' }}
          onClick={onToggleWall ? () => onToggleWall(r, c) : undefined}
        />
      );
      if (grid.start[0] === r && grid.start[1] === c) {
        cells.push(
          <text key={`s-${r},${c}`} x={pad + c * cell + cell / 2} y={pad + r * cell + cell / 2 + 4}
            textAnchor="middle" fontSize={11} fill="var(--paper)" fontWeight={600}>S</text>
        );
      }
      if (grid.end[0] === r && grid.end[1] === c) {
        cells.push(
          <text key={`e-${r},${c}`} x={pad + c * cell + cell / 2} y={pad + r * cell + cell / 2 + 4}
            textAnchor="middle" fontSize={11} fill="var(--paper)" fontWeight={600}>E</text>
        );
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Grid pathfinding">
      {cells}
    </svg>
  );
}
