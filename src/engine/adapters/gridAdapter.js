// Grid domain adapter — tracks per-cell status ('frontier'|'visited'|'path').
//
// Input: { rows, cols, start:[r,c], end:[r,c], walls: Set<string>|string[] }.
// State:
//   { rows, cols, start, end, walls:Set, cells:Map<'r,c', status>, current }

import { toUnified } from '../schema.js';

export function createGridAdapter() {
  let initial = null;
  let state = fresh(null);

  return {
    initialize(input) {
      initial = input ?? null;
      state = fresh(initial);
    },
    reset() { state = fresh(initial); },
    applyStep(step) {
      const u = toUnified(step);
      if (!u || u.domain !== 'grid') return;
      const key = `${u.payload.r},${u.payload.c}`;
      switch (u.action) {
        case 'grid-frontier': {
          const existing = state.cells.get(key);
          if (existing !== 'visited' && existing !== 'path') {
            state.cells.set(key, 'frontier');
          }
          break;
        }
        case 'grid-visit':
          state.cells.set(key, 'visited');
          state.current = [u.payload.r, u.payload.c];
          break;
        case 'grid-path':
          state.cells.set(key, 'path');
          break;
        case 'grid-relax':
          // Purely informational at the adapter level; distances can be
          // tracked by the algorithm's own metrics if needed.
          break;
        default: break;
      }
    },
    getState() {
      return {
        rows: state.rows,
        cols: state.cols,
        start: state.start,
        end: state.end,
        walls: [...state.walls],
        cells: [...state.cells.entries()],
        current: state.current ? [...state.current] : null,
      };
    },
    clone() {
      const c = createGridAdapter();
      c.initialize(initial);
      c.__restore(this.getState());
      return c;
    },
    __restore(snap) {
      state = {
        rows: snap.rows,
        cols: snap.cols,
        start: snap.start,
        end: snap.end,
        walls: new Set(snap.walls),
        cells: new Map(snap.cells),
        current: snap.current ? [...snap.current] : null,
      };
    },
  };
}

function fresh(input) {
  return {
    rows: input?.rows ?? 0,
    cols: input?.cols ?? 0,
    start: input?.start ?? null,
    end: input?.end ?? null,
    walls: new Set(input?.walls ?? []),
    cells: new Map(),
    current: null,
  };
}
