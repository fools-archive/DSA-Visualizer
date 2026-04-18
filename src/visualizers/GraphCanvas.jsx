import { useMemo } from 'react';

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function reduceSteps(steps, upTo) {
  const visited = new Set();
  const frontier = new Set();
  const traversed = new Set();
  let activeNode = null;
  let activeEdge = null;
  for (let i = 0; i < upTo; i++) {
    const s = steps[i];
    if (!s) continue;
    const isCurrent = i === upTo - 1;
    if (isCurrent) {
      activeNode = null;
      activeEdge = null;
    }
    switch (s.type) {
      case 'enqueue':
      case 'push':
        frontier.add(s.nodeId);
        break;
      case 'dequeue':
      case 'pop':
        frontier.delete(s.nodeId);
        break;
      case 'visit-node':
        visited.add(s.nodeId);
        if (isCurrent) activeNode = s.nodeId;
        break;
      case 'traverse-edge': {
        const k = edgeKey(s.from, s.to);
        traversed.add(k);
        if (isCurrent) activeEdge = k;
        break;
      }
      default: break;
    }
  }
  return { visited, frontier, traversed, activeNode, activeEdge };
}

export default function GraphCanvas({ graph, steps, index }) {
  const view = useMemo(() => reduceSteps(steps, index), [steps, index]);
  const W = 760, H = 440;
  const nodeMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  const nodeStyle = (id) => {
    if (id === view.activeNode) return { fill: 'var(--state-active)', stroke: 'var(--state-active)', text: 'var(--accent-ink)' };
    if (view.visited.has(id))   return { fill: 'var(--paper)', stroke: 'var(--state-visited)', text: 'var(--state-visited)' };
    if (view.frontier.has(id))  return { fill: 'var(--paper)', stroke: 'var(--state-frontier)', text: 'var(--state-frontier)' };
    return                            { fill: 'var(--paper)', stroke: 'var(--rule-strong)', text: 'var(--ink)' };
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Graph figure">
      {graph.edges.map(([a, b]) => {
        const k = edgeKey(a, b);
        const na = nodeMap[a], nb = nodeMap[b];
        let stroke = 'var(--rule-strong)';
        let width = 1;
        let dash;
        if (view.traversed.has(k)) { stroke = 'var(--state-visited)'; width = 1.5; }
        if (view.activeEdge === k) { stroke = 'var(--state-path)'; width = 2.5; dash = '6 4'; }
        return (
          <line
            key={k}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={stroke} strokeWidth={width}
            strokeDasharray={dash}
            style={{ transition: 'stroke 180ms cubic-bezier(0.25,1,0.5,1)' }}
          />
        );
      })}
      {graph.nodes.map((n) => {
        const s = nodeStyle(n.id);
        return (
          <g key={n.id}>
            <circle
              cx={n.x} cy={n.y} r="22"
              fill={s.fill} stroke={s.stroke} strokeWidth="1.5"
              style={{ transition: 'fill 180ms cubic-bezier(0.25,1,0.5,1), stroke 180ms cubic-bezier(0.25,1,0.5,1)' }}
            />
            <text
              x={n.x} y={n.y + 5}
              textAnchor="middle"
              fill={s.text}
              fontSize="14"
              fontWeight="500"
              style={{ fontFamily: 'var(--font-mono)' }}
            >{n.id}</text>
          </g>
        );
      })}
    </svg>
  );
}
