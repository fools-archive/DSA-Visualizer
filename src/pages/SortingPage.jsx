import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import Legend from '../components/Legend.jsx';
import SortingCanvas from '../visualizers/SortingCanvas.jsx';
import bubbleSort from '../algorithms/sorting/bubbleSort.js';
import selectionSort from '../algorithms/sorting/selectionSort.js';
import insertionSort from '../algorithms/sorting/insertionSort.js';
import { randomArray, parseIntList } from '../utils/random.js';

const ALGOS = {
  bubble: { label: 'Bubble Sort', fn: bubbleSort },
  selection: { label: 'Selection Sort', fn: selectionSort },
  insertion: { label: 'Insertion Sort', fn: insertionSort }
};

export default function SortingPage() {
  const [algo, setAlgo] = useState('bubble');
  const [array, setArray] = useState(() => randomArray(12));
  const [inputStr, setInputStr] = useState(() => array.join(', '));
  const [error, setError] = useState(null);
  const player = usePlayer([]);

  const steps = useMemo(() => ALGOS[algo].fn(array), [algo, array]);

  useEffect(() => {
    player.controls.loadSteps(steps);
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
          Three elementary methods, rendered as figures. Each emits a sequence of <em>compare</em>,
          <em> swap</em>, and <em> overwrite</em> events — the canvas reduces the sequence into
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
              options={Object.entries(ALGOS).map(([v, a]) => ({ value: v, label: a.label }))}
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
                { label: 'In final place', color: 'var(--state-sorted)' }
              ]}
            />
          </div>
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <SortingCanvas initial={array} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 1.1</span>
              <span><em>{ALGOS[algo].label}</em> on an array of length {array.length}.</span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
