import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import useComparison from '../engine/useComparison.js';
import { computeMetrics, metricFieldsByCategory, metricLabels } from '../engine/metrics.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import SortingCanvas from '../visualizers/SortingCanvas.jsx';
import { sortingAlgorithms, getAlgorithm } from '../algorithms/registry.js';

const DEFAULT = [5, 2, 9, 1, 7, 3, 8, 4, 6];

export default function ComparePage() {
  const [algoA, setAlgoA] = useState('bubble');
  const [algoB, setAlgoB] = useState('quick');
  const [arr, setArr] = useState(DEFAULT);
  const [input, setInput] = useState(DEFAULT.join(', '));

  const playerA = usePlayer([]);
  const playerB = usePlayer([]);

  const entryA = getAlgorithm('sorting', algoA) ?? sortingAlgorithms[0];
  const entryB = getAlgorithm('sorting', algoB) ?? sortingAlgorithms[0];

  const stepsA = useMemo(() => entryA.fn([...arr]), [entryA, arr]);
  const stepsB = useMemo(() => entryB.fn([...arr]), [entryB, arr]);

  useEffect(() => { playerA.controls.loadSteps(stepsA); /* eslint-disable-line */ }, [stepsA]);
  useEffect(() => { playerB.controls.loadSteps(stepsB); /* eslint-disable-line */ }, [stepsB]);

  const comp = useComparison(playerA, playerB, { defaultLocked: true });

  const handleInput = (v) => {
    const parts = v.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    if (parts.length) {
      setArr(parts);
      setInput(parts.join(', '));
    }
  };

  const randomize = () => {
    const n = 10;
    const next = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 20));
    setArr(next);
    setInput(next.join(', '));
  };

  const fields = metricFieldsByCategory.sorting;
  const metricsA = useMemo(() => computeMetrics(playerA.steps, playerA.index), [playerA.steps, playerA.index]);
  const metricsB = useMemo(() => computeMetrics(playerB.steps, playerB.index), [playerB.steps, playerB.index]);

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter VIII</span>
          <span className="chapter-tag">— two readers, one text</span>
        </div>
        <h1>Comparison.</h1>
        <p className="dek">
          Two sorting methods on the same input, side by side. In <em>locked</em>
          mode the controls below advance both in unison; in <em>free</em> mode
          each has its own scrubber.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Input</h3>
              <span className="section-num">§ 8.1</span>
            </div>
            <InputPanel
              label="Array (comma-separated)"
              placeholder="5, 2, 9, 1, 7"
              value={input}
              onChange={setInput}
              onSubmit={handleInput}
              submitLabel="Load"
              extra={<button type="button" className="btn" onClick={randomize}>Randomize</button>}
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Algorithms</h3>
              <span className="section-num">§ 8.2</span>
            </div>
            <AlgorithmSelect label="Left" value={algoA} onChange={setAlgoA}
              options={sortingAlgorithms.map((a) => ({ value: a.id, label: a.label }))} />
            <AlgorithmSelect label="Right" value={algoB} onChange={setAlgoB}
              options={sortingAlgorithms.map((a) => ({ value: a.id, label: a.label }))} />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Sync</h3>
              <span className="section-num">§ 8.3</span>
            </div>
            <label className="debug-toggle">
              <input type="checkbox" checked={comp.locked}
                onChange={(e) => comp.setLocked(e.target.checked)} />
              <span>Locked step (drive both)</span>
            </label>
            <p className="hint">
              Locked: shared play/pause/step. Free: each side independent.
            </p>
          </div>
          <section className="metrics">
            <h3 className="marginalia-head">Metrics</h3>
            <dl className="metrics-list">
              <div className="metrics-row"><dt>{entryA.label}</dt><dd>{entryB.label}</dd></div>
              {fields.map((f) => (
                <div className="metrics-row" key={f}>
                  <dt><span className="tabular">{metricsA[f] ?? 0}</span> · {metricLabels[f] ?? f}</dt>
                  <dd className="tabular">{metricsB[f] ?? 0}</dd>
                </div>
              ))}
              <div className="metrics-row">
                <dt><span className="tabular">{Math.round(playerA.elapsedMs)}</span> · Elapsed ms</dt>
                <dd className="tabular">{Math.round(playerB.elapsedMs)}</dd>
              </div>
            </dl>
          </section>
        </aside>

        <section className="study-main">
          <div className="compare-grid">
            <figure className="figure">
              <div className="figure-frame">
                <SortingCanvas initial={arr} steps={playerA.steps} index={playerA.index} />
              </div>
              <figcaption className="figure-caption">
                <span className="fig-num">Fig. 8.1a</span>
                <span><em>{entryA.label}</em> — {playerA.index}/{playerA.totalSteps}</span>
              </figcaption>
              {!comp.locked && <PlayerControls player={playerA} />}
            </figure>
            <figure className="figure">
              <div className="figure-frame">
                <SortingCanvas initial={arr} steps={playerB.steps} index={playerB.index} />
              </div>
              <figcaption className="figure-caption">
                <span className="fig-num">Fig. 8.1b</span>
                <span><em>{entryB.label}</em> — {playerB.index}/{playerB.totalSteps}</span>
              </figcaption>
              {!comp.locked && <PlayerControls player={playerB} />}
            </figure>
          </div>

          {comp.locked && (
            <div className="compare-controls">
              <button className="btn" onClick={comp.controls.reset}>⏮ Reset</button>
              <button className="btn" onClick={comp.controls.stepBackward}>◀ Step</button>
              {comp.playing
                ? <button className="btn primary" onClick={comp.controls.pause}>⏸ Pause</button>
                : <button className="btn primary" onClick={comp.controls.play}>▶ Play</button>}
              <button className="btn" onClick={comp.controls.stepForward}>Step ▶</button>
              <label className="speed">
                <span>Speed</span>
                <input type="range" min={50} max={1200} step={50}
                  value={comp.speed}
                  onChange={(e) => comp.setSpeed(Number(e.target.value))} />
                <span className="tabular">{comp.speed}ms</span>
              </label>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
