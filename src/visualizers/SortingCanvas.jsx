import { useMemo } from 'react';

function reduceSteps(initial, steps, upTo) {
  const arr = [...initial];
  const sorted = new Set();
  let active = new Set();
  let swapping = new Set();
  for (let i = 0; i < upTo; i++) {
    const s = steps[i];
    if (!s) continue;
    if (i === upTo - 1) {
      active = new Set();
      swapping = new Set();
    }
    switch (s.type) {
      case 'compare':
        if (i === upTo - 1) active = new Set(s.indices);
        break;
      case 'swap':
        [arr[s.indices[0]], arr[s.indices[1]]] = [arr[s.indices[1]], arr[s.indices[0]]];
        if (i === upTo - 1) swapping = new Set(s.indices);
        break;
      case 'overwrite':
        arr[s.index] = s.value;
        if (i === upTo - 1) swapping = new Set([s.index]);
        break;
      case 'mark-sorted':
        sorted.add(s.index);
        break;
      default: break;
    }
  }
  return { arr, sorted, active, swapping };
}

export default function SortingCanvas({ initial, steps, index }) {
  const view = useMemo(() => reduceSteps(initial, steps, index), [initial, steps, index]);
  const n = view.arr.length;
  const max = Math.max(...view.arr, 1);
  const W = 760;
  const H = 420;
  const padX = 32;
  const padTop = 28;
  const padBottom = 44;
  const gap = 6;
  const barW = n > 0 ? (W - padX * 2 - gap * (n - 1)) / n : 0;
  const plotH = H - padTop - padBottom;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sorting figure">
      <line
        x1={padX - 8} x2={W - padX + 8}
        y1={H - padBottom} y2={H - padBottom}
        stroke="var(--rule-strong)" strokeWidth="1"
      />
      <line
        x1={padX - 8} x2={padX - 4}
        y1={padTop} y2={padTop}
        stroke="var(--rule)" strokeWidth="1"
      />
      <text
        x={padX - 10} y={padTop + 4}
        textAnchor="end" fontSize="10" className="figure-axis"
      >max {max}</text>

      {view.arr.map((v, i) => {
        const h = (v / max) * plotH;
        const x = padX + i * (barW + gap);
        const y = H - padBottom - h;
        let fill = 'var(--state-default)';
        if (view.sorted.has(i)) fill = 'var(--state-sorted)';
        else if (view.swapping.has(i)) fill = 'var(--state-swap)';
        else if (view.active.has(i)) fill = 'var(--state-compare)';
        const isHighlighted = view.active.has(i) || view.swapping.has(i);
        return (
          <g key={i}>
            <rect
              x={x} y={y}
              width={barW}
              height={h}
              fill={fill}
              rx="0"
              style={{ transition: 'fill 180ms cubic-bezier(0.25,1,0.5,1)' }}
            />
            {barW > 12 && (
              <text
                x={x + barW / 2}
                y={H - padBottom + 14}
                fontSize="10"
                textAnchor="middle"
                fill="var(--ink-3)"
              >{v}</text>
            )}
            {barW > 12 && isHighlighted && (
              <text
                x={x + barW / 2}
                y={y - 6}
                fontSize="10"
                textAnchor="middle"
                fill="var(--accent)"
                fontWeight="600"
              >{v}</text>
            )}
            {barW > 12 && (
              <text
                x={x + barW / 2}
                y={H - padBottom + 28}
                fontSize="9"
                textAnchor="middle"
                className="figure-axis"
              >{i}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
