import {
  visitGraphNode,
  traverseEdge,
  enqueue,
  dequeue
} from '../../engine/stepTypes.js';
import { buildAdjacency } from './sampleGraph.js';

export default function bfs(graph, start) {
  const adj = buildAdjacency(graph);
  if (!adj[start]) return [];
  const steps = [];
  const visited = new Set();
  const queue = [start];
  visited.add(start);
  steps.push(enqueue(start));

  while (queue.length > 0) {
    const node = queue.shift();
    steps.push(dequeue(node));
    steps.push(visitGraphNode(node));
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        steps.push(traverseEdge(node, neighbor));
        visited.add(neighbor);
        queue.push(neighbor);
        steps.push(enqueue(neighbor));
      }
    }
  }
  return steps;
}
