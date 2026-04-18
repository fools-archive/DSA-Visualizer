import { gridFrontier, gridVisit, gridRelax, gridPath, note } from '../../engine/stepTypes.js';
import { cellKey, inBounds, isWall, NEIGHBORS } from './sampleGrid.js';

export default function gridBfs(grid) {
  const steps = [];
  const [sr, sc] = grid.start;
  const [er, ec] = grid.end;
  const prev = new Map();
  const visited = new Set([cellKey(sr, sc)]);
  const queue = [[sr, sc]];
  steps.push(gridFrontier(sr, sc));

  while (queue.length) {
    const [r, c] = queue.shift();
    steps.push(gridVisit(r, c));
    if (r === er && c === ec) break;
    for (const [dr, dc] of NEIGHBORS) {
      const nr = r + dr, nc = c + dc;
      if (!inBounds(grid, nr, nc) || isWall(grid, nr, nc)) continue;
      const k = cellKey(nr, nc);
      if (visited.has(k)) continue;
      visited.add(k);
      prev.set(k, [r, c]);
      queue.push([nr, nc]);
      steps.push(gridFrontier(nr, nc));
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
