import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import Legend from '../components/Legend.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import SortingCanvas from '../visualizers/SortingCanvas.jsx';
import SnapshotShare from '../components/SnapshotShare.jsx';
import { sortingAlgorithms, getAlgorithm } from '../algorithms/registry.js';
import { randomArray, parseIntList } from '../utils/random.js';
import { readSnapshotFromHash } from '../engine/persistence.js';

export default function SortingPage() {
  // Restore-from-URL runs once on mount. If the hash carries a sorting
  // snapshot, seed (algo, array, index) from it so the link reproduces
  // exactly the state it was shared from.
  const initial = (() => {
    const snap = readSnapshotFromHash();
    if (snap && snap.category === 'sorting' && Array.isArray(snap.input?.array)) {
      return { algo: snap.algoId || 'bubble', array: snap.input.array, index: snap.index | 0 };
    }
    return null;
  })();

  const [algo, setAlgo] = useState(initial?.algo ?? 'bubble');
  const [array, setArray] = useState(() => initial?.array ?? randomArray(12));
  const [inputStr, setInputStr] = useState(() => (initial?.array ?? array).join(', '));
  const [error, setError] = useState(null);
  const player = usePlayer([]);

  const entry = getAlgorithm('sorting', algo) ?? sortingAlgorithms[0];
  const steps = useMemo(() => entry.fn(array), [entry, array]);

  useEffect(() => {
    player.controls.loadSteps(steps);
    if (initial?.index) player.controls.jumpToIndex(initial.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const handleLoad = (str) => {
    const parsed = parseIntList(str);
    if (parsed.length === 0) return setError('Enter at least one number.');
    if (parsed.length > 40) return setError('Max 40 elements.');
    setError(null);
    setArray(parsed);
    setInputStr(parsed.join(', '));
  };

  const handleRandom = () => {
    const arr = randomArray(12);
    setArray(arr);
    setInputStr(arr.join(', '));
    setError(null);
  };

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter I</span>
          <span className="chapter-tag">— on putting things in order</span>
        </div>
        <h1>Sorting.</h1>
        <p className="dek">
          Six methods, rendered as figures. Each emits a sequence of <em>compare</em>,
          <em> swap</em>, <em> overwrite</em>, and — for the divide-and-conquer pair —
          <em> pivot</em> and <em> range</em> events. The canvas reduces the sequence into
          a bar chart frame-by-frame.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Parameters</h3>
              <span className="section-num">§ 1.1</span>
            </div>
            <AlgorithmSelect
              label="Method"
              value={algo}
              onChange={setAlgo}
              options={sortingAlgorithms.map((a) => ({ value: a.id, label: a.label }))}
            />
            <InputPanel
              label="Input array"
              placeholder="e.g. 5, 3, 8, 1, 9"
              value={inputStr}
              onSubmit={handleLoad}
              onChange={setInputStr}
              error={error}
              hint="Up to 40 integers, comma separated."
              submitLabel="Load"
              extra={<button type="button" className="btn ghost" onClick={handleRandom}>Shuffle</button>}
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 1.2</span>
            </div>
            <Legend
              items={[
                { label: 'Resting', color: 'var(--state-default)' },
                { label: 'Under comparison', color: 'var(--state-compare)' },
                { label: 'Moved this step', color: 'var(--state-swap)' },
                { label: 'Pivot / active range', color: 'var(--accent)' },
                { label: 'In final place', color: 'var(--state-sorted)' }
              ]}
            />
          </div>
          <MetricsPanel player={player} category="sorting" />
          <SnapshotShare category="sorting" algoId={algo} input={{ array }} index={player.index} />
          <DebugPanel player={player} category="sorting" algoId={algo} input={{ array }} />
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <SortingCanvas initial={array} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 1.1</span>
              <span>
                <em>{entry.label}</em> on an array of length {array.length}.
                {entry.complexity && <> &nbsp;— <span className="tabular">{entry.complexity.time}</span> time, <span className="tabular">{entry.complexity.space}</span> space.</>}
              </span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
