import { useMemo } from 'react';
import { cloneTree } from '../algorithms/trees/bst.js';

function applySteps(initialTree, steps, upTo) {
  const tree = cloneTree(initialTree);
  let activeNode = null;
  let compareNodeId = null;
  const visited = new Set();

  for (let i = 0; i < upTo; i++) {
    const s = steps[i];
    if (!s) continue;
    const isCurrent = i === upTo - 1;
    if (isCurrent) {
      activeNode = null;
      compareNodeId = null;
    }
    switch (s.type) {
      case 'insert': {
        tree.nodes[s.nodeId] = {
          id: s.nodeId,
          value: s.value,
          left: null,
          right: null,
          parent: s.parentId
        };
        if (s.parentId == null) tree.rootId = s.nodeId;
        else {
          const p = tree.nodes[s.parentId];
          if (s.side === 'left') p.left = s.nodeId;
          else if (s.side === 'right') p.right = s.nodeId;
        }
        if (isCurrent) activeNode = s.nodeId;
        break;
      }
      case 'delete': {
        const node = tree.nodes[s.nodeId];
        if (node) {
          const childId = node.left || node.right;
          if (!node.parent) tree.rootId = childId;
          else {
            const p = tree.nodes[node.parent];
            if (p.left === node.id) p.left = childId;
            else if (p.right === node.id) p.right = childId;
          }
          if (childId) tree.nodes[childId].parent = node.parent;
          delete tree.nodes[s.nodeId];
        }
        break;
      }
      case 'replace-value': {
        if (tree.nodes[s.nodeId]) tree.nodes[s.nodeId].value = s.value;
        if (isCurrent) activeNode = s.nodeId;
        break;
      }
      case 'compare-node': {
        if (isCurrent) compareNodeId = s.nodeId;
        break;
      }
      case 'visit': {
        visited.add(s.nodeId);
        if (isCurrent) activeNode = s.nodeId;
        break;
      }
      default: break;
    }
  }
  return { tree, activeNode, compareNodeId, visited };
}

function layoutTree(tree) {
  const positions = {};
  if (!tree.rootId) return { positions, total: 0, maxDepth: 0 };
  let counter = 0;
  const depths = {};
  const walk = (id, depth) => {
    if (!id) return;
    const n = tree.nodes[id];
    walk(n.left, depth + 1);
    positions[id] = { order: counter++, depth };
    depths[id] = depth;
    walk(n.right, depth + 1);
  };
  walk(tree.rootId, 0);
  const total = counter;
  let maxDepth = 0;
  for (const d of Object.values(depths)) if (d > maxDepth) maxDepth = d;
  return { positions, total, maxDepth };
}

export default function TreeCanvas({ initialTree, steps, index }) {
  const { tree, activeNode, compareNodeId, visited } = useMemo(
    () => applySteps(initialTree, steps, index),
    [initialTree, steps, index]
  );
  const { positions, total, maxDepth } = useMemo(() => layoutTree(tree), [tree]);

  const W = 760;
  const H = 440;
  const pad = 44;
  const r = 20;
  const colW = total > 1 ? (W - pad * 2) / (total - 1) : 0;
  const rowH = maxDepth > 0 ? (H - pad * 2) / maxDepth : 0;
  const coord = (id) => {
    const p = positions[id];
    const x = total <= 1 ? W / 2 : pad + p.order * colW;
    const y = pad + p.depth * rowH;
    return { x, y };
  };

  const nodeIds = Object.keys(tree.nodes);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Tree figure">
      {nodeIds.map((id) => {
        const n = tree.nodes[id];
        const from = coord(id);
        return (
          <g key={'e-' + id}>
            {n.left && (
              <line
                x1={from.x} y1={from.y}
                x2={coord(n.left).x} y2={coord(n.left).y}
                stroke="var(--rule-strong)" strokeWidth="1"
              />
            )}
            {n.right && (
              <line
                x1={from.x} y1={from.y}
                x2={coord(n.right).x} y2={coord(n.right).y}
                stroke="var(--rule-strong)" strokeWidth="1"
              />
            )}
          </g>
        );
      })}
      {nodeIds.map((id) => {
        const { x, y } = coord(id);
        let fill = 'var(--paper)';
        let stroke = 'var(--rule-strong)';
        let textFill = 'var(--ink)';
        if (id === activeNode) { fill = 'var(--state-active)'; stroke = 'var(--state-active)'; textFill = 'var(--accent-ink)'; }
        else if (id === compareNodeId) { fill = 'var(--state-compare)'; stroke = 'var(--state-compare)'; textFill = 'var(--accent-ink)'; }
        else if (visited.has(id)) { fill = 'var(--paper)'; stroke = 'var(--state-visited)'; textFill = 'var(--state-visited)'; }
        return (
          <g key={id}>
            <circle
              cx={x} cy={y} r={r}
              fill={fill} stroke={stroke} strokeWidth="1.5"
              style={{ transition: 'fill 180ms cubic-bezier(0.25,1,0.5,1), stroke 180ms cubic-bezier(0.25,1,0.5,1)' }}
            />
            <text
              x={x} y={y + 4}
              textAnchor="middle"
              fill={textFill}
              fontSize="13"
              fontWeight="500"
              style={{ fontFamily: 'var(--font-mono)' }}
            >{tree.nodes[id].value}</text>
          </g>
        );
      })}
      {nodeIds.length === 0 && (
        <text
          x={W / 2} y={H / 2}
          textAnchor="middle"
          fill="var(--ink-3)"
          fontSize="14"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >The tree is empty.</text>
      )}
    </svg>
  );
}
