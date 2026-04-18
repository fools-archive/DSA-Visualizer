import { gridFrontier, gridVisit, gridRelax, gridPath, note } from '../../engine/stepTypes.js';
import { cellKey, inBounds, isWall, NEIGHBORS } from './sampleGrid.js';

// Uniform-cost grid — every unblocked cell costs 1. We still use a min-heap
// so the algorithm is recognizable as Dijkstra (not BFS in disguise).
// Cell weights could be extended via a `weightAt(r,c)` function later.

export default function gridDijkstra(grid) {
  const steps = [];
  const [sr, sc] = grid.start;
  const [er, ec] = grid.end;
  const dist = new Map();
  const prev = new Map();
  const startKey = cellKey(sr, sc);
  dist.set(startKey, 0);

  const pq = new MinHeap();
  pq.push([0, sr, sc]);
  steps.push(gridRelax(sr, sc, 0));
  steps.push(gridFrontier(sr, sc));

  const visited = new Set();

  while (!pq.empty()) {
    const [d, r, c] = pq.pop();
    const k = cellKey(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    steps.push(gridVisit(r, c));
    if (r === er && c === ec) break;

    for (const [dr, dc] of NEIGHBORS) {
      const nr = r + dr, nc = c + dc;
      if (!inBounds(grid, nr, nc) || isWall(grid, nr, nc)) continue;
      const nk = cellKey(nr, nc);
      if (visited.has(nk)) continue;
      const nd = d + 1;
      if (nd < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nd);
        prev.set(nk, [r, c]);
        pq.push([nd, nr, nc]);
        steps.push(gridFrontier(nr, nc));
        steps.push(gridRelax(nr, nc, nd, [r, c]));
      }
    }
  }

  if (!prev.has(cellKey(er, ec)) && !(sr === er && sc === ec)) {
    steps.push(note('No path to end.'));
    return steps;
  }

  const path = [];
  let cur = [er, ec];
  while (cur) {
    path.push(cur);
    const p = prev.get(cellKey(cur[0], cur[1]));
    if (!p) break;
    cur = p;
  }
  path.reverse();
  for (const [r, c] of path) steps.push(gridPath(r, c));
  return steps;
}

class MinHeap {
  constructor() { this.a = []; }
  empty() { return this.a.length === 0; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let s = i;
        if (l < a.length && a[l][0] < a[s][0]) s = l;
        if (r < a.length && a[r][0] < a[s][0]) s = r;
        if (s === i) break;
        [a[s], a[i]] = [a[i], a[s]];
        i = s;
      }
    }
    return top;
  }
}
