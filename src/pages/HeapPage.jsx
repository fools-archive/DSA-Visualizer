import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import Legend from '../components/Legend.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import HeapCanvas from '../visualizers/HeapCanvas.jsx';
import {
  buildHeapSilent,
  insertSteps,
  extractMinSteps,
  createHeap,
} from '../algorithms/heap/minHeap.js';
import { parseIntList } from '../utils/random.js';

const MODES = {
  insert: 'Insert',
  extract: 'Extract min',
};

const DEFAULT_SEED = [8, 3, 12, 1, 7, 15, 4];

export default function HeapPage() {
  const [seedStr, setSeedStr] = useState(DEFAULT_SEED.join(', '));
  const [heap, setHeap] = useState(() => buildHeapSilent(DEFAULT_SEED));
  const [mode, setMode] = useState('insert');
  const [opValue, setOpValue] = useState('5');
  const [error, setError] = useState(null);

  const player = usePlayer([]);

  const { steps } = useMemo(() => {
    if (mode === 'extract') return extractMinSteps(heap);
    const v = Number(opValue);
    if (!Number.isFinite(v)) return { steps: [] };
    return insertSteps(heap, v);
  }, [mode, heap, opValue]);

  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const commitOp = () => {
    if (mode === 'extract') {
      const { heap: next } = extractMinSteps(heap);
      setHeap(next);
    } else {
      const v = Number(opValue);
      if (!Number.isFinite(v)) return;
      const { heap: next } = insertSteps(heap, v);
      setHeap(next);
    }
  };

  const handleSeed = (str) => {
    const parsed = parseIntList(str);
    if (parsed.length === 0) return setError('Enter at least one number.');
    setError(null);
    setHeap(buildHeapSilent(parsed));
    setSeedStr(parsed.join(', '));
  };

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter IV</span>
          <span className="chapter-tag">— the priority queue</span>
        </div>
        <h1>Heap.</h1>
        <p className="dek">
          An array read as a binary tree. Each parent holds the minimum of its subtree;
          <em> insert</em> bubbles up; <em> extract-min</em> swaps in the last leaf and sifts down.
          The invariant survives every step.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Seed</h3>
              <span className="section-num">§ 4.1</span>
            </div>
            <InputPanel
              label="Initial values"
              placeholder="8, 3, 12, 1"
              value={seedStr}
              onSubmit={handleSeed}
              onChange={setSeedStr}
              error={error}
              submitLabel="Rebuild"
              extra={<button type="button" className="btn ghost" onClick={() => setHeap(createHeap())}>Clear</button>}
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Operation</h3>
              <span className="section-num">§ 4.2</span>
            </div>
            <AlgorithmSelect
              label="Mode"
              value={mode}
              onChange={setMode}
              options={Object.entries(MODES).map(([v, l]) => ({ value: v, label: l }))}
            />
            {mode === 'insert' && (
              <div className="field">
                <label>Value to insert</label>
                <input type="number" value={opValue} onChange={(e) => setOpValue(e.target.value)} />
              </div>
            )}
            <div className="field-row">
              <button className="btn primary" onClick={commitOp}>Commit {mode}</button>
            </div>
            <span className="hint">Preview with the player, then commit to mutate the heap.</span>
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 4.3</span>
            </div>
            <Legend
              items={[
                { label: 'Node', color: 'var(--state-default)' },
                { label: 'Comparing', color: 'var(--state-compare)' },
                { label: 'Swapped', color: 'var(--state-swap)' },
                { label: 'Just inserted', color: 'var(--state-active)' },
              ]}
            />
          </div>
          <MetricsPanel player={player} category="heap" />
          <DebugPanel player={player} />
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <HeapCanvas initial={heap} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 4.1</span>
              <span><em>{MODES[mode]}</em> on a min-heap of size {heap.length}.</span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
