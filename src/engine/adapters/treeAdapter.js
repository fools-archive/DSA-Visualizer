// Tree domain adapter. Rebuilds a node table from insert/delete/rotate
// steps and tracks transient visiting/comparing highlights.
//
// State:
//   { nodes: Map<id, {id, value, parentId, leftId, rightId}>,
//     rootId: string|null,
//     visiting: Set<id>, comparing: Set<id>,
//     lastOp: {action, nodeId}|null }

import { toUnified } from '../schema.js';

export function createTreeAdapter() {
  let initial = null;
  let state = fresh();

  function applyStep(step) {
    const u = toUnified(step);
    if (!u || u.domain !== 'tree') return;
    if (u.kind === 'operation') {
      state.visiting = new Set();
      state.comparing = new Set();
    }
    const p = u.payload;
    switch (u.action) {
      case 'visit':
        if (p.nodeId != null) state.visiting.add(p.nodeId);
        break;
      case 'compare-node':
        if (p.nodeId != null) state.comparing.add(p.nodeId);
        break;
      case 'insert': {
        const node = {
          id: p.nodeId,
          value: p.value,
          parentId: p.parentId ?? null,
          leftId: null,
          rightId: null,
        };
        state.nodes.set(p.nodeId, node);
        if (p.parentId == null) {
          state.rootId = p.nodeId;
        } else {
          const parent = state.nodes.get(p.parentId);
          if (parent) {
            if (p.side === 'left') parent.leftId = p.nodeId;
            else if (p.side === 'right') parent.rightId = p.nodeId;
          }
        }
        break;
      }
      case 'delete': {
        const n = state.nodes.get(p.nodeId);
        if (n) {
          if (n.parentId != null) {
            const parent = state.nodes.get(n.parentId);
            if (parent) {
              if (parent.leftId === p.nodeId) parent.leftId = null;
              if (parent.rightId === p.nodeId) parent.rightId = null;
            }
          } else if (state.rootId === p.nodeId) {
            state.rootId = null;
          }
          state.nodes.delete(p.nodeId);
        }
        break;
      }
      case 'replace-value': {
        const n = state.nodes.get(p.nodeId);
        if (n) n.value = p.value;
        break;
      }
      case 'rotate-left':
      case 'rotate-right':
        // Structural rotation is algorithm-controlled; we only mark which
        // node was the pivot for the visualizer to animate.
        state.lastOp = { action: u.action, nodeId: p.nodeId };
        return;
      default: break;
    }
    state.lastOp = { action: u.action, nodeId: p.nodeId ?? null };
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
        nodes: [...state.nodes.values()].map((n) => ({ ...n })),
        rootId: state.rootId,
        visiting: [...state.visiting],
        comparing: [...state.comparing],
        lastOp: state.lastOp ? { ...state.lastOp } : null,
      };
    },
    clone() {
      const c = createTreeAdapter();
      c.initialize(initial);
      c.__restore(this.getState());
      return c;
    },
    __restore(snap) {
      state = {
        nodes: new Map(snap.nodes.map((n) => [n.id, { ...n }])),
        rootId: snap.rootId,
        visiting: new Set(snap.visiting),
        comparing: new Set(snap.comparing),
        lastOp: snap.lastOp ? { ...snap.lastOp } : null,
      };
    },
  };
}

function fresh() {
  return {
    nodes: new Map(),
    rootId: null,
    visiting: new Set(),
    comparing: new Set(),
    lastOp: null,
  };
}
