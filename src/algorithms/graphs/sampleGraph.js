// Deterministic demo graph with fixed positions for visualization.
// Edges: [a, b] or [a, b, weight]. Weight defaults to 1 when absent.
// Adjacency lists are sorted to guarantee deterministic traversal order.

export const sampleGraph = {
  nodes: [
    { id: 'A', x: 120, y: 80 },
    { id: 'B', x: 300, y: 60 },
    { id: 'C', x: 480, y: 100 },
    { id: 'D', x: 600, y: 220 },
    { id: 'E', x: 460, y: 320 },
    { id: 'F', x: 260, y: 340 },
    { id: 'G', x: 100, y: 240 },
    { id: 'H', x: 340, y: 200 }
  ],
  edges: [
    ['A', 'B', 4], ['A', 'G', 3], ['A', 'H', 7],
    ['B', 'C', 2], ['B', 'H', 5],
    ['C', 'D', 3], ['C', 'H', 6],
    ['D', 'E', 2],
    ['E', 'F', 4], ['E', 'H', 1],
    ['F', 'G', 3], ['F', 'H', 2],
    ['G', 'H', 5]
  ]
};

// A small graph with a cycle for cycleDetect.
export const cycleGraph = {
  nodes: [
    { id: 'A', x: 140, y: 120 },
    { id: 'B', x: 320, y: 80 },
    { id: 'C', x: 500, y: 140 },
    { id: 'D', x: 520, y: 320 },
    { id: 'E', x: 300, y: 360 },
    { id: 'F', x: 120, y: 300 },
  ],
  edges: [
    ['A', 'B'], ['B', 'C'], ['C', 'D'],
    ['D', 'E'], ['E', 'F'], ['F', 'A'],
    ['B', 'E'],
  ],
};

// String-neighbor adjacency (bfs/dfs keep this shape).
export function buildAdjacency(graph) {
  const adj = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const edge of graph.edges) {
    const a = edge[0], b = edge[1];
    adj[a].push(b);
    adj[b].push(a);
  }
  for (const id of Object.keys(adj)) adj[id].sort();
  return adj;
}

// Weighted adjacency: { [id]: [{ to, w }, …] }.
export function buildWeightedAdjacency(graph) {
  const adj = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const edge of graph.edges) {
    const [a, b, w = 1] = edge;
    adj[a].push({ to: b, w });
    adj[b].push({ to: a, w });
  }
  for (const id of Object.keys(adj)) adj[id].sort((x, y) => (x.to < y.to ? -1 : 1));
  return adj;
}
