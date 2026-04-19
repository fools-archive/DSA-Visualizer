import { toUnified } from '../schema.js';

// Grid adapter — tracks per-cell state ('frontier' | 'visited' | 'path').
// Input: { rows, cols, start:[r,c], end:[r,c], walls: Set<string> }.
// State: { cells: Map<'r,c', status>, rows, cols, start, end, walls, current }

export function createGridAdapter() {
  let initial = null;
  let state = null;

  function fresh(input) {
    return {
      rows: input.rows,
      cols: input.cols,
      start: input.start,
      end: input.end,
      walls: new Set(input.walls ?? []),
      cells: new Map(),
      current: null,
    };
  }

  return {
    initialize(input) {
      initial = input;
      state = fresh(input);
    },
    reset() { state = fresh(initial); },
    applyStep(step) {
      const u = toUnified(step);
      if (!u || u.domain !== 'grid') return;
      const key = `${u.payload.r},${u.payload.c}`;
      switch (u.action) {
        case 'grid-frontier':
          if (state.cells.get(key) !== 'visited' && state.cells.get(key) !== 'path') {
            state.cells.set(key, 'frontier');
          }
          break;
        case 'grid-visit':
          state.cells.set(key, 'visited');
          state.current = [u.payload.r, u.payload.c];
          break;
        case 'grid-path':
          state.cells.set(key, 'path');
          break;
        case 'grid-relax':
          // purely informational; distance tracking could be added here
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
      const snap = this.getState();
      c.__restore(snap);
      return c;
    },
    __restore(snap) {
      state = {
        rows: snap.rows, cols: snap.cols,
        start: snap.start, end: snap.end,
        walls: new Set(snap.walls),
        cells: new Map(snap.cells),
        current: snap.current,
      };
    },
  };
}
