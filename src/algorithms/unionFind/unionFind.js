// Disjoint-set forest with union-by-rank and path compression.
// State shape: { parent: { [x]: x }, rank: { [x]: 0 } }
// Pure step emitters — we clone and return { steps, state }.

import {
  ufFind,
  ufUnion,
  ufCompress,
  note,
} from '../../engine/stepTypes.js';

export const createUnionFind = (elements = []) => {
  const parent = {};
  const rank = {};
  for (const e of elements) {
    parent[e] = e;
    rank[e] = 0;
  }
  return { parent, rank };
};

export const cloneUF = (s) => ({ parent: { ...s.parent }, rank: { ...s.rank } });

function findRoot(state, x, steps) {
  // collect the path to root
  const path = [];
  let cur = x;
  while (state.parent[cur] !== cur) {
    path.push(cur);
    cur = state.parent[cur];
  }
  const root = cur;
  steps.push(ufFind(x, root));
  // path compression
  for (const p of path) {
    if (state.parent[p] !== root) {
      state.parent[p] = root;
      steps.push(ufCompress(p, root));
    }
  }
  return root;
}

export function findSteps(initial, x) {
  const state = cloneUF(initial);
  const steps = [];
  if (!(x in state.parent)) {
    steps.push(note(`${x} not in set`));
    return { steps, state };
  }
  findRoot(state, x, steps);
  return { steps, state };
}

export function unionSteps(initial, a, b) {
  const state = cloneUF(initial);
  const steps = [];
  if (!(a in state.parent) || !(b in state.parent)) {
    steps.push(note(`element missing`));
    return { steps, state };
  }
  const ra = findRoot(state, a, steps);
  const rb = findRoot(state, b, steps);
  if (ra === rb) {
    steps.push(note(`${a} and ${b} already in same set`));
    return { steps, state };
  }
  let newRoot;
  if (state.rank[ra] < state.rank[rb]) {
    state.parent[ra] = rb;
    newRoot = rb;
  } else if (state.rank[ra] > state.rank[rb]) {
    state.parent[rb] = ra;
    newRoot = ra;
  } else {
    state.parent[rb] = ra;
    state.rank[ra]++;
    newRoot = ra;
  }
  steps.push(ufUnion(a, b, newRoot));
  return { steps, state };
}

// Derive the current forest view: for each element, record its parent.
// Useful for the visualizer.
export function snapshot(state) {
  return { parent: { ...state.parent }, rank: { ...state.rank } };
}
