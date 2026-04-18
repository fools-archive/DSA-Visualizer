// Step event factories. Algorithms MUST produce steps via these functions
// to guarantee shape consistency for the rendering reducers.
//
// Contract:
//   - Pure emitters: fn(input) => Step[]
//   - Mutating tree/graph ops: fn(state, ...args) => { steps: Step[], state }
// Every Step is a plain object with a required `type` discriminator.

// --- Sorting ---
export const compare = (i, j) => ({ type: 'compare', indices: [i, j] });
export const swap = (i, j) => ({ type: 'swap', indices: [i, j] });
export const overwrite = (index, value) => ({ type: 'overwrite', index, value });
export const markSorted = (index) => ({ type: 'mark-sorted', index });
export const pivot = (index) => ({ type: 'pivot', index });
export const rangeHighlight = (lo, hi, depth = 0) =>
  ({ type: 'range-highlight', lo, hi, depth });

// --- Tree ---
export const visitNode = (nodeId) => ({ type: 'visit', nodeId });
export const compareNode = (nodeId, value) => ({ type: 'compare-node', nodeId, value });
export const insertNode = (nodeId, parentId, value, side) =>
  ({ type: 'insert', nodeId, parentId, value, side });
export const deleteNode = (nodeId) => ({ type: 'delete', nodeId });
export const replaceNodeValue = (nodeId, value) =>
  ({ type: 'replace-value', nodeId, value });
export const rotateLeft = (nodeId) => ({ type: 'rotate-left', nodeId });
export const rotateRight = (nodeId) => ({ type: 'rotate-right', nodeId });

// --- Graph ---
export const visitGraphNode = (nodeId) => ({ type: 'visit-node', nodeId });
export const traverseEdge = (from, to) => ({ type: 'traverse-edge', from, to });
export const enqueue = (nodeId) => ({ type: 'enqueue', nodeId });
export const dequeue = (nodeId) => ({ type: 'dequeue', nodeId });
export const pushStack = (nodeId) => ({ type: 'push', nodeId });
export const popStack = (nodeId) => ({ type: 'pop', nodeId });
export const relax = (nodeId, newDist, viaEdge) =>
  ({ type: 'relax', nodeId, newDist, viaEdge });
export const finalize = (nodeId, dist) => ({ type: 'finalize', nodeId, dist });
export const cycleFound = (nodeIds) => ({ type: 'cycle-found', nodeIds });

// --- Heap ---
export const heapCompare = (i, j) => ({ type: 'heap-compare', indices: [i, j] });
export const heapSwap = (i, j) => ({ type: 'heap-swap', indices: [i, j] });
export const heapInsert = (index, value) => ({ type: 'heap-insert', index, value });
export const heapExtract = (index, value) => ({ type: 'heap-extract', index, value });

// --- Union-Find ---
export const ufFind = (x, root) => ({ type: 'uf-find', x, root });
export const ufUnion = (a, b, newRoot) => ({ type: 'uf-union', a, b, newRoot });
export const ufCompress = (x, root) => ({ type: 'uf-compress', x, root });

// --- Grid pathfinding ---
export const gridFrontier = (r, c) => ({ type: 'grid-frontier', r, c });
export const gridVisit = (r, c) => ({ type: 'grid-visit', r, c });
export const gridRelax = (r, c, dist, from = null) =>
  ({ type: 'grid-relax', r, c, dist, from });
export const gridPath = (r, c) => ({ type: 'grid-path', r, c });

// --- Dynamic programming ---
// dpUpdate marks a table cell as newly written. `deps` is an optional list
// of [r,c] the value was computed from — the DP canvas draws dependency
// arrows to those cells for the duration the updated cell remains active.
export const dpUpdate = (r, c, value, deps = []) =>
  ({ type: 'dp-update', r, c, value, deps });
export const dpHighlight = (r, c) => ({ type: 'dp-highlight', r, c });
export const dpTrace = (r, c) => ({ type: 'dp-trace', r, c });

// --- Shared ---
export const note = (message) => ({ type: 'note', message });
export const annotate = (targetId, key, value) =>
  ({ type: 'annotate', targetId, key, value });
