// Step event factories. Algorithms MUST produce steps via these functions
// to guarantee shape consistency for the rendering reducers.

// --- Sorting ---
export const compare = (i, j) => ({ type: 'compare', indices: [i, j] });
export const swap = (i, j) => ({ type: 'swap', indices: [i, j] });
export const overwrite = (index, value) => ({ type: 'overwrite', index, value });
export const markSorted = (index) => ({ type: 'mark-sorted', index });

// --- Tree ---
export const visitNode = (nodeId) => ({ type: 'visit', nodeId });
export const compareNode = (nodeId, value) => ({ type: 'compare-node', nodeId, value });
export const insertNode = (nodeId, parentId, value, side) =>
  ({ type: 'insert', nodeId, parentId, value, side });
export const deleteNode = (nodeId) => ({ type: 'delete', nodeId });
export const replaceNodeValue = (nodeId, value) =>
  ({ type: 'replace-value', nodeId, value });

// --- Graph ---
export const visitGraphNode = (nodeId) => ({ type: 'visit-node', nodeId });
export const traverseEdge = (from, to) => ({ type: 'traverse-edge', from, to });
export const enqueue = (nodeId) => ({ type: 'enqueue', nodeId });
export const dequeue = (nodeId) => ({ type: 'dequeue', nodeId });
export const pushStack = (nodeId) => ({ type: 'push', nodeId });
export const popStack = (nodeId) => ({ type: 'pop', nodeId });

// --- Shared ---
export const note = (message) => ({ type: 'note', message });
