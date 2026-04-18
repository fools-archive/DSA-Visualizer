// Shared grid model. The grid is a pure value: rows/cols + a set of wall
// keys (`"r,c"`) + start/end cells. Pathfinding algorithms consume this
// and emit step events; they never mutate the grid.

export function cellKey(r, c) { return `${r},${c}`; }

export function makeGrid({ rows, cols, start, end, walls = [] }) {
  return {
    rows,
    cols,
    start,
    end,
    walls: new Set(walls.map(([r, c]) => cellKey(r, c))),
  };
}

export function toggleWall(grid, r, c) {
  const k = cellKey(r, c);
  const walls = new Set(grid.walls);
  if (walls.has(k)) walls.delete(k);
  else walls.add(k);
  return { ...grid, walls };
}

export function isWall(grid, r, c) {
  return grid.walls.has(cellKey(r, c));
}

export function inBounds(grid, r, c) {
  return r >= 0 && c >= 0 && r < grid.rows && c < grid.cols;
}

export const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export const defaultGrid = makeGrid({
  rows: 12,
  cols: 20,
  start: [1, 1],
  end: [10, 18],
  walls: [
    [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
    [3, 10], [4, 10], [5, 10], [6, 10], [8, 10], [9, 10], [10, 10],
    [7, 14], [7, 15], [7, 16], [6, 16], [5, 16],
  ],
});
