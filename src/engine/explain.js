// Explanation layer — deterministic prose for each step.
//
// Templates are keyed by (domain, action). Each template is a function of
// the normalized payload so the output is a pure projection of the step.
// No algorithm owns its own copy of these strings.

import { toUnified } from './schema.js';

const T = {
  // --- array / sorting ---
  'array/compare': (p) =>
    `Comparing elements at indices ${p.indices?.[0]} and ${p.indices?.[1]}.`,
  'array/swap': (p) =>
    `Swapping indices ${p.indices?.[0]} and ${p.indices?.[1]} to restore order.`,
  'array/overwrite': (p) => `Overwriting index ${p.index} with value ${p.value}.`,
  'array/mark-sorted': (p) => `Index ${p.index} is now in its final position.`,
  'array/pivot': (p) => `Choosing index ${p.index} as the pivot.`,
  'array/range-highlight': (p) =>
    `Working on sub-range [${p.lo}, ${p.hi}] at depth ${p.depth ?? 0}.`,
  'array/heap-compare': (p) => `Heap compare between indices ${p.indices?.join(' and ')}.`,
  'array/heap-swap': (p) => `Heap swap between indices ${p.indices?.join(' and ')}.`,
  'array/heap-insert': (p) => `Inserting ${p.value} into the heap at index ${p.index}.`,
  'array/heap-extract': (p) => `Extracting ${p.value} from the heap root.`,

  // --- tree ---
  'tree/visit': (p) => `Visiting node ${p.nodeId}.`,
  'tree/compare-node': (p) => `Comparing ${p.value} against node ${p.nodeId}.`,
  'tree/insert': (p) =>
    `Inserting ${p.value} as ${p.side} child of ${p.parentId ?? 'root'}.`,
  'tree/delete': (p) => `Deleting node ${p.nodeId}.`,
  'tree/replace-value': (p) => `Replacing value at ${p.nodeId} with ${p.value}.`,
  'tree/rotate-left': (p) => `Left-rotation at ${p.nodeId}.`,
  'tree/rotate-right': (p) => `Right-rotation at ${p.nodeId}.`,

  // --- graph ---
  'graph/visit-node': (p) => `Visiting graph node ${p.nodeId}.`,
  'graph/traverse-edge': (p) => `Traversing edge ${p.from} → ${p.to}.`,
  'graph/enqueue': (p) => `Enqueuing ${p.nodeId} onto the frontier.`,
  'graph/dequeue': (p) => `Dequeuing ${p.nodeId} from the frontier.`,
  'graph/push': (p) => `Pushing ${p.nodeId} onto the stack.`,
  'graph/pop': (p) => `Popping ${p.nodeId} off the stack.`,
  'graph/relax': (p) =>
    `Relaxing ${p.nodeId}; new distance ${p.newDist} via ${formatEdge(p.viaEdge)}.`,
  'graph/finalize': (p) => `Finalizing ${p.nodeId} with distance ${p.dist}.`,
  'graph/cycle-found': (p) => `Cycle detected: ${p.nodeIds?.join(' → ')}.`,
  'graph/uf-find': (p) => `Find(${p.x}) resolves to root ${p.root}.`,
  'graph/uf-union': (p) =>
    `Union(${p.a}, ${p.b}); new root is ${p.newRoot}.`,
  'graph/uf-compress': (p) => `Path compression: ${p.x} → ${p.root}.`,

  // --- grid ---
  'grid/grid-frontier': (p) => `Cell (${p.r}, ${p.c}) added to the frontier.`,
  'grid/grid-visit': (p) => `Visiting cell (${p.r}, ${p.c}).`,
  'grid/grid-relax': (p) =>
    `Relaxing (${p.r}, ${p.c}) to distance ${p.dist}` +
    (p.from ? ` via (${p.from[0]}, ${p.from[1]}).` : '.'),
  'grid/grid-path': (p) => `Path includes (${p.r}, ${p.c}).`,

  // --- dp ---
  'dp/dp-update': (p) => {
    const deps = p.deps?.length
      ? ` using ${p.deps.map(([r, c]) => `dp[${r}][${c}]`).join(' and ')}`
      : '';
    return `Writing dp[${p.r}][${p.c}] = ${p.value}${deps}.`;
  },
  'dp/dp-highlight': (p) => `Computing dp[${p.r}][${p.c}].`,
  'dp/dp-trace': (p) => `Tracing optimal path through dp[${p.r}][${p.c}].`,

  // --- shared ---
  'shared/note': (p) => p.message ?? '',
  'shared/annotate': (p) => `${p.key}(${p.targetId}) = ${p.value}`,
};

export function explain(step) {
  const u = toUnified(step);
  if (!u) return '';
  const t = T[`${u.domain}/${u.action}`];
  if (t) return t(u.payload);
  return `${u.domain}/${u.action}`;
}

// Summarize a [start, end) slice as a short English sentence. Used by
// the execution-trace viewer to describe a run of steps.
export function explainRange(steps, start, end) {
  if (!steps.length) return '';
  const lo = Math.max(0, start);
  const hi = Math.min(steps.length, end);
  const counts = new Map();
  for (let i = lo; i < hi; i++) {
    const u = toUnified(steps[i]);
    if (!u || u.kind !== 'operation') continue;
    const k = `${u.domain}/${u.action}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  if (!counts.size) return `${hi - lo} annotations.`;
  const parts = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, n]) => `${n} × ${k.split('/')[1]}`);
  return `${hi - lo} steps: ${parts.join(', ')}.`;
}

function formatEdge(e) {
  if (!e) return 'a predecessor';
  if (Array.isArray(e)) return `${e[0]} → ${e[1]}`;
  if (e.from && e.to) return `${e.from} → ${e.to}`;
  return String(e);
}
