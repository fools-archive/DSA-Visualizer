import {
  visitGraphNode,
  traverseEdge,
  enqueue,
  relax,
  finalize,
  annotate,
} from '../../engine/stepTypes.js';
import { buildWeightedAdjacency } from './sampleGraph.js';

export default function dijkstra(graph, start) {
  const adj = buildWeightedAdjacency(graph);
  if (!adj[start]) return [];
  const steps = [];
  const dist = {};
  const visited = new Set();
  for (const n of graph.nodes) dist[n.id] = Infinity;
  dist[start] = 0;
  steps.push(annotate(start, 'dist', 0));
  steps.push(enqueue(start));

  while (visited.size < graph.nodes.length) {
    // pick unvisited with min dist
    let u = null;
    let best = Infinity;
    for (const id of Object.keys(dist)) {
      if (!visited.has(id) && dist[id] < best) {
        best = dist[id];
        u = id;
      }
    }
    if (u == null) break;
    visited.add(u);
    steps.push(visitGraphNode(u));
    steps.push(finalize(u, dist[u]));
    for (const { to: v, w } of adj[u]) {
      if (visited.has(v)) continue;
      steps.push(traverseEdge(u, v));
      const candidate = dist[u] + w;
      if (candidate < dist[v]) {
        dist[v] = candidate;
        steps.push(relax(v, candidate, [u, v]));
        steps.push(annotate(v, 'dist', candidate));
        steps.push(enqueue(v));
      }
    }
  }
  return steps;
}
