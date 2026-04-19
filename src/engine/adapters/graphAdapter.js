// Graph domain adapter. Handles traversals (BFS/DFS), shortest-path
// relaxation, and union-find projections.
//
// State:
//   { visited:Set<id>, frontier:Set<id>, traversed:Set<'from->to'>,
//     distances:Map<id, number>, finalized:Set<id>,
//     cycle:string[]|null, ufParent:Map<id, id>,
//     active:Set<id>  // transient (visit-node, relax, etc.) }

import { toUnified } from '../schema.js';

export function createGraphAdapter() {
  let initial = null;
  let state = fresh();

  function applyStep(step) {
    const u = toUnified(step);
    if (!u || u.domain !== 'graph') return;
    if (u.kind === 'operation') state.active = new Set();
    const p = u.payload;
    switch (u.action) {
      case 'visit-node':
        state.visited.add(p.nodeId);
        state.frontier.delete(p.nodeId);
        state.active.add(p.nodeId);
        break;
      case 'traverse-edge':
        if (p.from != null && p.to != null) {
          state.traversed.add(`${p.from}->${p.to}`);
          state.active.add(p.from);
          state.active.add(p.to);
        }
        break;
      case 'enqueue':
      case 'push':
        state.frontier.add(p.nodeId);
        state.active.add(p.nodeId);
        break;
      case 'dequeue':
      case 'pop':
        state.frontier.delete(p.nodeId);
        state.active.add(p.nodeId);
        break;
      case 'relax':
        if (p.nodeId != null) {
          state.distances.set(p.nodeId, p.newDist);
          state.active.add(p.nodeId);
        }
        break;
      case 'finalize':
        state.finalized.add(p.nodeId);
        if (p.dist != null) state.distances.set(p.nodeId, p.dist);
        break;
      case 'cycle-found':
        state.cycle = [...(p.nodeIds ?? [])];
        break;
      case 'uf-find':
      case 'uf-compress':
        if (p.x != null) {
          if (p.root != null) state.ufParent.set(p.x, p.root);
          state.active.add(p.x);
        }
        break;
      case 'uf-union':
        if (p.newRoot != null) {
          if (p.a != null) state.ufParent.set(p.a, p.newRoot);
          if (p.b != null) state.ufParent.set(p.b, p.newRoot);
        }
        if (p.a != null) state.active.add(p.a);
        if (p.b != null) state.active.add(p.b);
        break;
      default: break;
    }
  }

  return {
    initialize(input) {
      initial = input ?? null;
      state = fresh();
    },
    reset() { state = fresh(); },
    applyStep,
    getState() {
      return {
        visited: [...state.visited],
        frontier: [...state.frontier],
        traversed: [...state.traversed],
        distances: [...state.distances.entries()],
        finalized: [...state.finalized],
        cycle: state.cycle ? [...state.cycle] : null,
        ufParent: [...state.ufParent.entries()],
        active: [...state.active],
      };
    },
    clone() {
      const c = createGraphAdapter();
      c.initialize(initial);
      c.__restore(this.getState());
      return c;
    },
    __restore(snap) {
      state = {
        visited: new Set(snap.visited),
        frontier: new Set(snap.frontier),
        traversed: new Set(snap.traversed),
        distances: new Map(snap.distances),
        finalized: new Set(snap.finalized),
        cycle: snap.cycle ? [...snap.cycle] : null,
        ufParent: new Map(snap.ufParent),
        active: new Set(snap.active),
      };
    },
  };
}

function fresh() {
  return {
    visited: new Set(),
    frontier: new Set(),
    traversed: new Set(),
    distances: new Map(),
    finalized: new Set(),
    cycle: null,
    ufParent: new Map(),
    active: new Set(),
  };
}
