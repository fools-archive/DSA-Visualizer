// Dynamic-programming table adapter.
// Input config: { rows, cols } — dimensions of the DP table.
//
// State:
//   { rows, cols,
//     table: Map<'r,c', value>,
//     current: [r,c]|null,   // last dp-update or dp-highlight cell
//     deps: Array<[r,c]>,    // dependency arrows to draw for current cell
//     trace: Set<'r,c'>,     // cells on the reconstructed optimal path
//     highlight: Set<'r,c'> }

import { toUnified } from '../schema.js';

export function createDPAdapter(config = {}) {
  let initial = { rows: config.rows ?? 0, cols: config.cols ?? 0 };
  let state = fresh(initial);

  function applyStep(step) {
    const u = toUnified(step);
    if (!u || u.domain !== 'dp') return;
    if (u.kind === 'operation') {
      state.highlight = new Set();
      state.deps = [];
    }
    const p = u.payload;
    const key = `${p.r},${p.c}`;
    switch (u.action) {
      case 'dp-update':
        state.table.set(key, p.value);
        state.current = [p.r, p.c];
        state.deps = Array.isArray(p.deps) ? p.deps.map((d) => [...d]) : [];
        state.highlight = new Set([key]);
        break;
      case 'dp-highlight':
        state.current = [p.r, p.c];
        state.highlight.add(key);
        break;
      case 'dp-trace':
        state.trace.add(key);
        break;
      default: break;
    }
  }

  return {
    initialize(input) {
      initial = {
        rows: input?.rows ?? config.rows ?? 0,
        cols: input?.cols ?? config.cols ?? 0,
      };
      state = fresh(initial);
    },
    reset() { state = fresh(initial); },
    applyStep,
    getState() {
      return {
        rows: state.rows,
        cols: state.cols,
        table: [...state.table.entries()],
        current: state.current ? [...state.current] : null,
        deps: state.deps.map((d) => [...d]),
        trace: [...state.trace],
        highlight: [...state.highlight],
      };
    },
    clone() {
      const c = createDPAdapter(config);
      c.initialize(initial);
      c.__restore(this.getState());
      return c;
    },
    __restore(snap) {
      state = {
        rows: snap.rows,
        cols: snap.cols,
        table: new Map(snap.table),
        current: snap.current ? [...snap.current] : null,
        deps: snap.deps.map((d) => [...d]),
        trace: new Set(snap.trace),
        highlight: new Set(snap.highlight),
      };
    },
  };
}

function fresh(input) {
  return {
    rows: input.rows ?? 0,
    cols: input.cols ?? 0,
    table: new Map(),
    current: null,
    deps: [],
    trace: new Set(),
    highlight: new Set(),
  };
}
