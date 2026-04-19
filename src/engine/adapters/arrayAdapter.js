// Array domain adapter. Covers sorting and heap-on-array.
// State:
//   { array, sorted:Set<index>, active:Set<index>, swapping:Set<index>,
//     pivot:number|null, range:{lo,hi}|null }

import { toUnified } from '../schema.js';

export function createArrayAdapter() {
  let initial = [];
  let state = fresh([]);

  function applyStep(step) {
    const u = toUnified(step);
    if (!u) return;
    // Transient highlights reset on every new operation.
    if (u.kind === 'operation') {
      state.active = new Set();
      state.swapping = new Set();
    }
    const p = u.payload;
    switch (u.action) {
      case 'compare':
      case 'heap-compare':
        state.active = new Set(p.indices ?? []);
        break;
      case 'swap':
      case 'heap-swap': {
        const [i, j] = p.indices ?? [];
        if (i != null && j != null) {
          [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
          state.swapping = new Set([i, j]);
        }
        break;
      }
      case 'overwrite':
        if (p.index != null) {
          state.array[p.index] = p.value;
          state.swapping = new Set([p.index]);
        }
        break;
      case 'heap-insert':
        if (p.index != null) state.array[p.index] = p.value;
        break;
      case 'heap-extract':
        // The algorithm controls what stays in the slot; visualizer just
        // notes that the root was read.
        state.active = new Set([0]);
        break;
      case 'mark-sorted':
        if (p.index != null) state.sorted.add(p.index);
        break;
      case 'pivot':
        state.pivot = p.index ?? null;
        break;
      case 'range-highlight':
        state.range = { lo: p.lo, hi: p.hi, depth: p.depth ?? 0 };
        break;
      default: break;
    }
  }

  return {
    initialize(input) {
      initial = Array.isArray(input) ? [...input] : [];
      state = fresh(initial);
    },
    reset() { state = fresh(initial); },
    applyStep,
    getState() {
      return {
        array: [...state.array],
        sorted: [...state.sorted],
        active: [...state.active],
        swapping: [...state.swapping],
        pivot: state.pivot,
        range: state.range ? { ...state.range } : null,
      };
    },
    clone() {
      const c = createArrayAdapter();
      c.initialize(initial);
      const snap = this.getState();
      c.__restore(snap);
      return c;
    },
    __restore(snap) {
      state.array = [...snap.array];
      state.sorted = new Set(snap.sorted);
      state.active = new Set(snap.active);
      state.swapping = new Set(snap.swapping);
      state.pivot = snap.pivot;
      state.range = snap.range ? { ...snap.range } : null;
    },
  };
}

function fresh(arr) {
  return {
    array: [...arr],
    sorted: new Set(),
    active: new Set(),
    swapping: new Set(),
    pivot: null,
    range: null,
  };
}
