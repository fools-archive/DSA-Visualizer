export function formatStep(s) {
  if (!s) return '';
  switch (s.type) {
    case 'compare': return `compare(${s.indices.join(', ')})`;
    case 'swap': return `swap(${s.indices.join(', ')})`;
    case 'overwrite': return `overwrite(index=${s.index}, value=${s.value})`;
    case 'mark-sorted': return `mark-sorted(${s.index})`;
    case 'pivot': return `pivot at ${s.index}`;
    case 'range-highlight': return `range [${s.lo}..${s.hi}] depth=${s.depth ?? 0}`;
    case 'visit': return `visit node ${s.nodeId}`;
    case 'compare-node': return `compare at ${s.nodeId} with ${s.value}`;
    case 'insert': return `insert ${s.value} as ${s.side} child of ${s.parentId ?? 'root'}`;
    case 'delete': return `delete node ${s.nodeId}`;
    case 'replace-value': return `replace value at ${s.nodeId} → ${s.value}`;
    case 'rotate-left': return `rotate left at ${s.nodeId}`;
    case 'rotate-right': return `rotate right at ${s.nodeId}`;
    case 'visit-node': return `visit ${s.nodeId}`;
    case 'traverse-edge': return `traverse ${s.from} → ${s.to}`;
    case 'enqueue': return `enqueue ${s.nodeId}`;
    case 'dequeue': return `dequeue ${s.nodeId}`;
    case 'push': return `push ${s.nodeId}`;
    case 'pop': return `pop ${s.nodeId}`;
    case 'relax': return `relax ${s.nodeId} → ${s.newDist}`;
    case 'finalize': return `finalize ${s.nodeId} = ${s.dist}`;
    case 'cycle-found': return `cycle: ${s.nodeIds.join(' → ')}`;
    case 'heap-compare': return `heap-compare(${s.indices.join(', ')})`;
    case 'heap-swap': return `heap-swap(${s.indices.join(', ')})`;
    case 'heap-insert': return `heap-insert ${s.value} at ${s.index}`;
    case 'heap-extract': return `heap-extract ${s.value} from ${s.index}`;
    case 'uf-find': return `find(${s.x}) → root ${s.root}`;
    case 'uf-union': return `union(${s.a}, ${s.b}) → root ${s.newRoot}`;
    case 'uf-compress': return `compress ${s.x} → ${s.root}`;
    case 'grid-frontier': return `frontier (${s.r}, ${s.c})`;
    case 'grid-visit': return `visit cell (${s.r}, ${s.c})`;
    case 'grid-relax': return `relax (${s.r}, ${s.c}) = ${s.dist}`;
    case 'grid-path': return `path (${s.r}, ${s.c})`;
    case 'dp-update': {
      const d = s.deps?.length ? `  (deps: ${s.deps.map((x) => `[${x[0]},${x[1]}]`).join(', ')})` : '';
      return `dp[${s.r}][${s.c}] = ${s.value}${d}`;
    }
    case 'dp-highlight': return `dp-focus (${s.r}, ${s.c})`;
    case 'dp-trace': return `dp-trace (${s.r}, ${s.c})`;
    case 'annotate': return `${s.key}(${s.targetId}) = ${s.value}`;
    case 'note': return s.message;
    default: return JSON.stringify(s);
  }
}
