import { useMemo } from 'react';

function reduce(initial, steps, upTo) {
  const heap = [...initial];
  let active = new Set();
  let swapping = new Set();
  let justInserted = null;
  for (let i = 0; i < upTo; i++) {
    const s = steps[i];
    if (!s) continue;
    if (i === upTo - 1) {
      active = new Set();
      swapping = new Set();
      justInserted = null;
    }
    switch (s.type) {
      case 'heap-insert':
        heap[s.index] = s.value;
        if (i === upTo - 1) justInserted = s.index;
        break;
      case 'heap-extract':
        heap[0] = heap[heap.length - 1];
        heap.pop();
        break;
      case 'heap-compare':
        if (i === upTo - 1) active = new Set(s.indices);
        break;
      case 'heap-swap':
        [heap[s.indices[0]], heap[s.indices[1]]] = [heap[s.indices[1]], heap[s.indices[0]]];
        if (i === upTo - 1) swapping = new Set(s.indices);
        break;
      default: break;
    }
  }
  return { heap, active, swapping, justInserted };
}

// Lay out array indices as a binary tree.
function layout(n, W, H, padTop, padBottom) {
  if (n === 0) return [];
  const depth = Math.floor(Math.log2(n)) + 1;
  const levelH = (H - padTop - padBottom) / Math.max(1, depth - 1 || 1);
  const nodes = [];
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const indexInLevel = i - (2 ** level - 1);
    const nodesInLevel = 2 ** level;
    const slot = (indexInLevel + 0.5) / nodesInLevel;
    const x = slot * W;
    const y = padTop + level * levelH;
    nodes.push({ x, y, level, parent: i === 0 ? null : (i - 1) >> 1 });
  }
  return nodes;
}

export default function HeapCanvas({ initial, steps, index }) {
  const view = useMemo(() => reduce(initial, steps, index), [initial, steps, index]);
  const W = 760;
  const H = 420;
  const padTop = 40;
  const padBottom = 40;
  const positions = layout(view.heap.length, W, H, padTop, padBottom);
  const R = Math.min(22, Math.max(14, W / Math.max(view.heap.length * 2, 8)));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Heap figure">
      {positions.map((p, i) =>
        p.parent != null && positions[p.parent] ? (
          <line
            key={`e-${i}`}
            x1={positions[p.parent].x}
            y1={positions[p.parent].y}
            x2={p.x}
            y2={p.y}
            stroke="var(--rule-strong)"
            strokeWidth="1"
          />
        ) : null
      )}
      {positions.map((p, i) => {
        const v = view.heap[i];
        let stroke = 'var(--state-default)';
        if (view.swapping.has(i)) stroke = 'var(--state-swap)';
        else if (view.active.has(i)) stroke = 'var(--state-compare)';
        else if (view.justInserted === i) stroke = 'var(--state-active)';
        return (
          <g key={i} style={{ transition: 'transform 200ms cubic-bezier(0.25,1,0.5,1)' }}>
            <circle
              cx={p.x}
              cy={p.y}
              r={R}
              fill="var(--paper)"
              stroke={stroke}
              strokeWidth="1.5"
              style={{ transition: 'stroke 180ms' }}
            />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill="var(--ink)">{v}</text>
            <text x={p.x} y={p.y + R + 14} textAnchor="middle" fontSize="9" className="figure-axis">[{i}]</text>
          </g>
        );
      })}
      {/* array view at bottom */}
      <g transform={`translate(${W / 2}, ${H - 16})`}>
        <text textAnchor="middle" fontSize="10" className="figure-axis">
          array: [{view.heap.join(', ')}]
        </text>
      </g>
    </svg>
  );
}
