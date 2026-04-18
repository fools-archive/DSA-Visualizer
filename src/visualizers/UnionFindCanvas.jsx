import { useMemo } from 'react';

// Apply steps to get current parent map + transient highlights.
function reduce(initial, steps, upTo) {
  const parent = { ...initial.parent };
  const rank = { ...initial.rank };
  let findTarget = null;
  let findRoot = null;
  let unionNodes = null;
  let compressNode = null;
  for (let i = 0; i < upTo; i++) {
    const s = steps[i];
    if (!s) continue;
    const isCurrent = i === upTo - 1;
    if (isCurrent) {
      findTarget = null; findRoot = null; unionNodes = null; compressNode = null;
    }
    switch (s.type) {
      case 'uf-find':
        if (isCurrent) { findTarget = s.x; findRoot = s.root; }
        break;
      case 'uf-compress':
        parent[s.x] = s.root;
        if (isCurrent) compressNode = s.x;
        break;
      case 'uf-union':
        // we don't know exactly which became child without more data, recompute via roots
        if (s.newRoot === parent[s.a] && s.newRoot !== parent[s.b]) parent[s.b] = s.newRoot;
        if (s.newRoot === parent[s.b] && s.newRoot !== parent[s.a]) parent[s.a] = s.newRoot;
        // tie-break: if neither matches (both were already roots), attach non-root to newRoot
        if (parent[s.a] !== s.newRoot && parent[s.b] !== s.newRoot) {
          if (s.a === s.newRoot) parent[s.b] = s.newRoot;
          else if (s.b === s.newRoot) parent[s.a] = s.newRoot;
          else parent[s.a === s.newRoot ? s.b : s.a] = s.newRoot;
        }
        if (isCurrent) unionNodes = [s.a, s.b, s.newRoot];
        break;
      default: break;
    }
  }
  return { parent, rank, findTarget, findRoot, unionNodes, compressNode };
}

// Group elements into trees by their root.
function groupByRoot(parent) {
  const rootOf = (x) => {
    let c = x;
    while (parent[c] !== c) c = parent[c];
    return c;
  };
  const groups = {};
  for (const x of Object.keys(parent)) {
    const r = rootOf(x);
    if (!groups[r]) groups[r] = [];
    groups[r].push(x);
  }
  return groups;
}

// Layout trees side by side, each as a small node-link diagram.
function layoutForest(parent, W, H) {
  const groups = groupByRoot(parent);
  const roots = Object.keys(groups).sort();
  const gap = 40;
  const cellW = Math.max(120, (W - gap * (roots.length + 1)) / Math.max(roots.length, 1));
  const positions = {};
  roots.forEach((r, gi) => {
    const members = groups[r];
    // BFS from root for level placement
    const children = {};
    for (const m of members) children[m] = [];
    for (const m of members) if (m !== r) children[parent[m]].push(m);
    const levels = [[r]];
    let frontier = [r];
    while (true) {
      const next = frontier.flatMap((n) => children[n] || []);
      if (next.length === 0) break;
      levels.push(next);
      frontier = next;
    }
    const levelH = Math.min(72, (H - 80) / Math.max(levels.length, 1));
    const cx = gap + gi * (cellW + gap) + cellW / 2;
    levels.forEach((lvl, li) => {
      lvl.forEach((m, mi) => {
        const slot = (mi + 0.5) / lvl.length;
        positions[m] = {
          x: cx + (slot - 0.5) * Math.min(cellW, lvl.length * 40),
          y: 40 + li * levelH,
        };
      });
    });
  });
  return positions;
}

export default function UnionFindCanvas({ initial, steps, index }) {
  const view = useMemo(() => reduce(initial, steps, index), [initial, steps, index]);
  const W = 760, H = 420;
  const positions = layoutForest(view.parent, W, H);
  const elements = Object.keys(view.parent);

  const strokeOf = (id) => {
    if (view.unionNodes && id === view.unionNodes[2]) return 'var(--accent)';
    if (view.unionNodes && (id === view.unionNodes[0] || id === view.unionNodes[1])) return 'var(--state-swap)';
    if (id === view.compressNode) return 'var(--state-active)';
    if (id === view.findTarget) return 'var(--state-compare)';
    if (id === view.findRoot) return 'var(--accent)';
    return 'var(--state-default)';
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Union-Find figure">
      {elements.map((id) => {
        const p = view.parent[id];
        if (p === id) return null;
        const a = positions[id], b = positions[p];
        if (!a || !b) return null;
        return (
          <line
            key={`e-${id}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="var(--rule-strong)" strokeWidth="1"
          />
        );
      })}
      {elements.map((id) => {
        const pos = positions[id];
        if (!pos) return null;
        return (
          <g key={id}>
            <circle
              cx={pos.x} cy={pos.y} r="18"
              fill="var(--paper)"
              stroke={strokeOf(id)}
              strokeWidth="1.5"
              style={{ transition: 'stroke 180ms' }}
            />
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fill="var(--ink)">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}
