import {
  visitGraphNode,
  traverseEdge,
  pushStack,
  popStack
} from '../../engine/stepTypes.js';
import { buildAdjacency } from './sampleGraph.js';

export default function dfs(graph, start) {
  const adj = buildAdjacency(graph);
  if (!adj[start]) return [];
  const steps = [];
  const visited = new Set();

  const walk = (node, parent) => {
    visited.add(node);
    steps.push(pushStack(node));
    if (parent) steps.push(traverseEdge(parent, node));
    steps.push(visitGraphNode(node));
    for (const n of adj[node]) {
      if (!visited.has(n)) walk(n, node);
    }
    steps.push(popStack(node));
  };

  walk(start, null);
  return steps;
}
