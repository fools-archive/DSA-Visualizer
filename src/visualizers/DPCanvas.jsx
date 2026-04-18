import { useMemo } from 'react';

// DPCanvas — renders a rows × cols table and folds dp-* events into cell
// values + per-cell state (updated | focus | trace). Dependency arrows are
// drawn from the most recently updated cell back to the cells it read.

function reduce(steps, index, rows, cols) {
  const values = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const updated = new Array(rows * cols).fill(false);
  let focus = null;          // [r,c] from dp-highlight
  let lastUpdate = null;     // { r, c, deps }
  const trace = new Set();   // "r,c" set

  const end = Math.max(0, Math.min(index, steps.length));
  for (let i = 0; i < end; i++) {
    const s = steps[i];
    switch (s.type) {
      case 'dp-update':
        if (s.r < rows && s.c < cols) {
          values[s.r][s.c] = s.value;
          updated[s.r * cols + s.c] = true;
          lastUpdate = { r: s.r, c: s.c, deps: s.deps ?? [] };
        }
        break;
      case 'dp-highlight':
        focus = [s.r, s.c];
        break;
      case 'dp-trace':
        trace.add(`${s.r},${s.c}`);
        break;
      default: break;
    }
  }
  return { values, updated, focus, lastUpdate, trace };
}

export default function DPCanvas({ rows, cols, steps, index, rowLabels, colLabels }) {
  const { values, updated, focus, lastUpdate, trace } = useMemo(
    () => reduce(steps, index, rows, cols),
    [steps, index, rows, cols]
  );

  // Size the cells to fit within the figure frame.
  const maxW = 680;
  const targetCell = Math.min(42, Math.max(20, Math.floor((maxW - 40) / cols)));
  const labelW = rowLabels ? 28 : 0;
  const labelH = colLabels ? 22 : 0;
  const pad = 10;
  const w = pad * 2 + labelW + cols * targetCell;
  const h = pad * 2 + labelH + rows * targetCell;

  const x = (c) => pad + labelW + c * targetCell;
  const y = (r) => pad + labelH + r * targetCell;

  const fillFor = (r, c) => {
    if (focus && focus[0] === r && focus[1] === c) return 'var(--state-compare)';
    if (trace.has(`${r},${c}`)) return 'var(--accent)';
    if (lastUpdate && lastUpdate.r === r && lastUpdate.c === c) return 'var(--state-active)';
    if (updated[r * cols + c]) return 'var(--state-visited)';
    return 'var(--paper-2)';
  };

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect key={`c-${r}-${c}`} x={x(c)} y={y(r)}
          width={targetCell - 1} height={targetCell - 1}
          fill={fillFor(r, c)} stroke="var(--rule)" strokeWidth={0.6}
          style={{ transition: 'fill 160ms ease-out' }}
        />
      );
      const v = values[r][c];
      if (v !== null && v !== undefined) {
        cells.push(
          <text key={`v-${r}-${c}`} x={x(c) + targetCell / 2} y={y(r) + targetCell / 2 + 4}
            textAnchor="middle" fontSize={Math.min(13, targetCell * 0.45)}
            className="tabular" fill="var(--ink)">{v}</text>
        );
      }
    }
  }

  const labels = [];
  if (colLabels) {
    for (let c = 0; c < cols; c++) {
      labels.push(
        <text key={`cl-${c}`} x={x(c) + targetCell / 2} y={pad + 14}
          textAnchor="middle" fontSize={11} fill="var(--ink-2)">
          {colLabels[c] ?? c}
        </text>
      );
    }
  }
  if (rowLabels) {
    for (let r = 0; r < rows; r++) {
      labels.push(
        <text key={`rl-${r}`} x={pad + labelW - 6} y={y(r) + targetCell / 2 + 4}
          textAnchor="end" fontSize={11} fill="var(--ink-2)">
          {rowLabels[r] ?? r}
        </text>
      );
    }
  }

  // Dependency arrows from lastUpdate.deps → lastUpdate
  const arrows = [];
  if (lastUpdate && lastUpdate.deps.length) {
    const tx = x(lastUpdate.c) + targetCell / 2;
    const ty = y(lastUpdate.r) + targetCell / 2;
    lastUpdate.deps.forEach(([dr, dc], idx) => {
      if (dr < 0 || dc < 0 || dr >= rows || dc >= cols) return;
      const sx = x(dc) + targetCell / 2;
      const sy = y(dr) + targetCell / 2;
      arrows.push(
        <line key={`arr-${idx}`} x1={sx} y1={sy} x2={tx} y2={ty}
          stroke="var(--accent)" strokeWidth={1.25} strokeDasharray="3 2"
          markerEnd="url(#dp-arrow)" opacity={0.8} />
      );
    });
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="DP table">
      <defs>
        <marker id="dp-arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
        </marker>
      </defs>
      {labels}
      {cells}
      {arrows}
    </svg>
  );
}
