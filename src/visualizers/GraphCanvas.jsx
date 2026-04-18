import { useMemo } from 'react';

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function reduceSteps(steps, upTo) {
  const visited = new Set();
  const frontier = new Set();
  const traversed = new Set();
  const finalized = new Set();
  const cycleEdges = new Set();
  const cycleNodes = new Set();
  const annotations = {}; // { [nodeId]: { [key]: value } }
  let activeNode = null;
  let activeEdge = null;
  let relaxEdge = null;
  for (let i = 0; i < upTo; i++) {
    const s = steps[i];
    if (!s) continue;
    const isCurrent = i === upTo - 1;
    if (isCurrent) {
      activeNode = null;
      activeEdge = null;
      relaxEdge = null;
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
      case 'relax': {
        const [u, v] = s.viaEdge;
        const k = edgeKey(u, v);
        if (isCurrent) relaxEdge = k;
        break;
      }
      case 'finalize':
        finalized.add(s.nodeId);
        break;
      case 'cycle-found':
        for (const id of s.nodeIds) cycleNodes.add(id);
        for (let j = 0; j < s.nodeIds.length - 1; j++) {
          cycleEdges.add(edgeKey(s.nodeIds[j], s.nodeIds[j + 1]));
        }
        break;
      case 'annotate':
        if (!annotations[s.targetId]) annotations[s.targetId] = {};
        annotations[s.targetId][s.key] = s.value;
        break;
      default: break;
    }
  }
  return {
    visited, frontier, traversed, finalized, cycleEdges, cycleNodes,
    annotations, activeNode, activeEdge, relaxEdge,
  };
}

export default function GraphCanvas({ graph, steps, index }) {
  const view = useMemo(() => reduceSteps(steps, index), [steps, index]);
  const W = 760, H = 440;
  const nodeMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const hasWeights = graph.edges.some((e) => e.length >= 3);

  const nodeStyle = (id) => {
    if (view.cycleNodes.has(id)) return { fill: 'var(--paper)', stroke: 'var(--accent)', text: 'var(--accent)' };
    if (id === view.activeNode)   return { fill: 'var(--state-active)', stroke: 'var(--state-active)', text: 'var(--accent-ink)' };
    if (view.finalized.has(id))   return { fill: 'var(--paper)', stroke: 'var(--accent)', text: 'var(--ink)' };
    if (view.visited.has(id))     return { fill: 'var(--paper)', stroke: 'var(--state-visited)', text: 'var(--state-visited)' };
    if (view.frontier.has(id))    return { fill: 'var(--paper)', stroke: 'var(--state-frontier)', text: 'var(--state-frontier)' };
    return                              { fill: 'var(--paper)', stroke: 'var(--rule-strong)', text: 'var(--ink)' };
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Graph figure">
      {graph.edges.map((edge) => {
        const [a, b, w] = edge;
        const k = edgeKey(a, b);
        const na = nodeMap[a], nb = nodeMap[b];
        let stroke = 'var(--rule-strong)';
        let width = 1;
        let dash;
        if (view.traversed.has(k)) { stroke = 'var(--state-visited)'; width = 1.5; }
        if (view.cycleEdges.has(k)) { stroke = 'var(--accent)'; width = 2; }
        if (view.activeEdge === k) { stroke = 'var(--state-path)'; width = 2.5; dash = '6 4'; }
        if (view.relaxEdge === k)  { stroke = 'var(--accent)'; width = 2.5; dash = '4 3'; }
        const mx = (na.x + nb.x) / 2;
        const my = (na.y + nb.y) / 2;
        return (
          <g key={k}>
            <line
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={stroke} strokeWidth={width}
              strokeDasharray={dash}
              style={{ transition: 'stroke 180ms cubic-bezier(0.25,1,0.5,1)' }}
            />
            {hasWeights && w != null && (
              <g>
                <rect x={mx - 10} y={my - 8} width="20" height="14" fill="var(--paper-2)" />
                <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" className="figure-axis">{w}</text>
              </g>
            )}
          </g>
        );
      })}
      {graph.nodes.map((n) => {
        const s = nodeStyle(n.id);
        const ann = view.annotations[n.id];
        const distLabel = ann?.dist != null ? (ann.dist === Infinity ? '∞' : ann.dist) : null;
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
            {distLabel != null && (
              <text
                x={n.x} y={n.y - 28}
                textAnchor="middle"
                fontSize="10"
                fill="var(--accent)"
                style={{ fontFamily: 'var(--font-mono)' }}
              >d={distLabel}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
