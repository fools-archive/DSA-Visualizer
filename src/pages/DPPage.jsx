import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import Legend from '../components/Legend.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import DPCanvas from '../visualizers/DPCanvas.jsx';
import { fibTabulation, fibMemo } from '../algorithms/dp/fibonacci.js';
import { knapsack } from '../algorithms/dp/knapsack.js';
import { lcs } from '../algorithms/dp/lcs.js';

const PROBLEMS = {
  'fib-tab':  { label: 'Fibonacci (tabulation)', family: 'fib' },
  'fib-memo': { label: 'Fibonacci (memoization)', family: 'fib' },
  'knapsack': { label: '0/1 Knapsack', family: 'knapsack' },
  'lcs':      { label: 'Longest common subsequence', family: 'lcs' },
};

export default function DPPage() {
  const [problem, setProblem] = useState('fib-tab');
  const [fibN, setFibN] = useState(8);
  const [weightsStr, setWeightsStr] = useState('2, 3, 4, 5');
  const [valuesStr, setValuesStr] = useState('3, 4, 5, 6');
  const [capacity, setCapacity] = useState(8);
  const [lcsA, setLcsA] = useState('AGCAT');
  const [lcsB, setLcsB] = useState('GAC');

  const player = usePlayer([]);

  const parsed = useMemo(() => {
    switch (problem) {
      case 'fib-tab': return fibTabulation(fibN);
      case 'fib-memo': return fibMemo(fibN);
      case 'knapsack': {
        const weights = weightsStr.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
        const values = valuesStr.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
        const n = Math.min(weights.length, values.length);
        return knapsack({ weights: weights.slice(0, n), values: values.slice(0, n), capacity });
      }
      case 'lcs': return lcs({ a: lcsA, b: lcsB });
      default: return { steps: [], rows: 0, cols: 0, meta: {} };
    }
  }, [problem, fibN, weightsStr, valuesStr, capacity, lcsA, lcsB]);

  useEffect(() => {
    player.controls.loadSteps(parsed.steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);

  const rowLabels = problem === 'lcs'
    ? ['ø', ...lcsA.split('')]
    : problem === 'knapsack'
    ? ['ø', ...(weightsStr.split(',').map((s) => s.trim()).filter(Boolean))]
    : null;
  const colLabels = problem === 'lcs'
    ? ['ø', ...lcsB.split('')]
    : problem === 'knapsack'
    ? Array.from({ length: parsed.cols }, (_, i) => i)
    : Array.from({ length: parsed.cols }, (_, i) => i);

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter VII</span>
          <span className="chapter-tag">— tables, subproblems, dependencies</span>
        </div>
        <h1>Dynamic programming.</h1>
        <p className="dek">
          A subproblem is a promise: solve me once and I'll stay solved.
          Three classics — <em>Fibonacci</em>, <em>0/1 knapsack</em>,
          and <em>LCS</em> — each rendered as a table with dependency arrows.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Problem</h3>
              <span className="section-num">§ 7.1</span>
            </div>
            <AlgorithmSelect
              label="Algorithm"
              value={problem}
              onChange={setProblem}
              options={Object.entries(PROBLEMS).map(([v, p]) => ({ value: v, label: p.label }))}
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Input</h3>
              <span className="section-num">§ 7.2</span>
            </div>
            {PROBLEMS[problem].family === 'fib' && (
              <InputPanel
                label="n (0 ≤ n ≤ 30)"
                placeholder="8"
                value={String(fibN)}
                onSubmit={(v) => setFibN(Math.max(0, Math.min(30, parseInt(v, 10) || 0)))}
                submitLabel="Run"
              />
            )}
            {PROBLEMS[problem].family === 'knapsack' && (
              <>
                <InputPanel label="Weights" placeholder="2, 3, 4, 5"
                  value={weightsStr} onSubmit={setWeightsStr} submitLabel="Apply" />
                <InputPanel label="Values" placeholder="3, 4, 5, 6"
                  value={valuesStr} onSubmit={setValuesStr} submitLabel="Apply" />
                <InputPanel label="Capacity" placeholder="8"
                  value={String(capacity)}
                  onSubmit={(v) => setCapacity(Math.max(0, Math.min(20, parseInt(v, 10) || 0)))}
                  submitLabel="Apply" />
              </>
            )}
            {PROBLEMS[problem].family === 'lcs' && (
              <>
                <InputPanel label="String A" placeholder="AGCAT"
                  value={lcsA} onSubmit={setLcsA} submitLabel="Apply" />
                <InputPanel label="String B" placeholder="GAC"
                  value={lcsB} onSubmit={setLcsB} submitLabel="Apply" />
              </>
            )}
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 7.3</span>
            </div>
            <Legend
              items={[
                { label: 'Unfilled', color: 'var(--paper-2)' },
                { label: 'Focus / computing', color: 'var(--state-compare)' },
                { label: 'Just written', color: 'var(--state-active)' },
                { label: 'Filled', color: 'var(--state-visited)' },
                { label: 'Trace-back', color: 'var(--accent)' },
              ]}
            />
          </div>
          <MetricsPanel player={player} category="dp" />
          <DebugPanel player={player} category="dp" algoId={problem} adapterInput={{ rows: parsed.rows, cols: parsed.cols }} />
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <DPCanvas
                rows={parsed.rows}
                cols={parsed.cols}
                steps={player.steps}
                index={player.index}
                rowLabels={rowLabels}
                colLabels={colLabels}
              />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 7.1</span>
              <span><em>{PROBLEMS[problem].label}</em> — table {parsed.rows}×{parsed.cols}.</span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
