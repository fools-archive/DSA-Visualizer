import {
  visitGraphNode,
  traverseEdge,
  pushStack,
  popStack,
  cycleFound,
  note,
} from '../../engine/stepTypes.js';
import { buildAdjacency } from './sampleGraph.js';

export default function cycleDetect(graph, start) {
  const adj = buildAdjacency(graph);
  if (!adj[start]) return [];
  const steps = [];
  const visited = new Set();
  const inStack = new Set();
  const parent = {};
  let cycle = null;

  const walk = (node, from) => {
    if (cycle) return;
    visited.add(node);
    inStack.add(node);
    parent[node] = from;
    steps.push(pushStack(node));
    steps.push(visitGraphNode(node));
    for (const n of adj[node]) {
      if (cycle) break;
      if (n === from) continue;
      steps.push(traverseEdge(node, n));
      if (inStack.has(n)) {
        const chain = [n];
        let cur = node;
        while (cur != null && cur !== n) {
          chain.push(cur);
          cur = parent[cur];
        }
        chain.push(n);
        cycle = chain.reverse();
        steps.push(cycleFound(cycle));
        return;
      }
      if (!visited.has(n)) walk(n, node);
    }
    inStack.delete(node);
    steps.push(popStack(node));
  };

  walk(start, null);
  if (!cycle) steps.push(note('no cycle reachable from ' + start));
  return steps;
}
