// Deterministic demo graph with fixed positions for visualization.
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
    ['A', 'B'], ['A', 'G'], ['A', 'H'],
    ['B', 'C'], ['B', 'H'],
    ['C', 'D'], ['C', 'H'],
    ['D', 'E'],
    ['E', 'F'], ['E', 'H'],
    ['F', 'G'], ['F', 'H'],
    ['G', 'H']
  ]
};

export function buildAdjacency(graph) {
  const adj = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const [a, b] of graph.edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  for (const id of Object.keys(adj)) adj[id].sort();
  return adj;
}
