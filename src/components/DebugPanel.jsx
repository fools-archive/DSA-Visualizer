import { formatStep } from '../engine/stepFormat.js';
import { buildTrace, downloadTrace } from '../engine/trace.js';
import { explain, explainRange } from '../engine/explain.js';
import useAdapterSnapshot from '../engine/useAdapterSnapshot.js';

// Category → adapter domain. Pages pass `category`; the adapter registry
// is keyed by `domain`. Heap/sorting both reduce onto the array domain;
// union-find projects onto graph.
const CATEGORY_TO_DOMAIN = {
  sorting: 'array',
  heap: 'array',
  trees: 'tree',
  graphs: 'graph',
  unionFind: 'graph',
  grid: 'grid',
  dp: 'dp',
};

// Debug / inspector panel. Pages pass (category, algoId, input) for trace
// labelling and `explain()` prose. If a page also supplies `adapterInput`
// the panel runs a checkpointed execution context and shows the
// adapter-reduced state at the current step.
export default function DebugPanel({
  player,
  category,
  algoId,
  input,
  adapterInput,
  adapterConfig,
}) {
  const { debug, currentStep, steps, index, totalSteps, controls } = player;

  const prevStep = index > 1 ? steps[index - 2] : null;
  const nextStep = index < steps.length ? steps[index] : null;

  const domain = CATEGORY_TO_DOMAIN[category] ?? null;
  const snapshot = useAdapterSnapshot({
    domain,
    steps: adapterInput !== undefined ? steps : null,
    input: adapterInput,
    config: adapterConfig,
    index,
  });

  const recapLo = Math.max(0, index - 20);
  const recap = index > 0 ? explainRange(steps, recapLo, index) : '';

  const handleExport = () => {
    const trace = buildTrace({ category, algoId, input, steps, index });
    downloadTrace(trace, `trace-${algoId ?? 'export'}.json`);
  };

  return (
    <details className="debug-panel" open={debug}>
      <summary>Debug &amp; inspector</summary>
      <label className="debug-toggle">
        <input type="checkbox" checked={debug} onChange={controls.toggleDebug} />
        <span>Log each step to console</span>
      </label>

      <div className="debug-frame">
        <div className="debug-row">
          <span className="debug-k">step</span>
          <span className="debug-v tabular">{index} / {totalSteps}</span>
        </div>
        {prevStep && (
          <div className="debug-row">
            <span className="debug-k">prev</span>
            <span className="debug-v">{formatStep(prevStep)}</span>
          </div>
        )}
        <div className="debug-row debug-current">
          <span className="debug-k">now</span>
          <span className="debug-v">{currentStep ? formatStep(currentStep) : '—'}</span>
        </div>
        {nextStep && (
          <div className="debug-row debug-next">
            <span className="debug-k">next</span>
            <span className="debug-v">{formatStep(nextStep)}</span>
          </div>
        )}
      </div>

      {currentStep && (
        <p className="debug-explain">{explain(currentStep)}</p>
      )}

      {recap && (
        <p className="debug-recap">
          <span className="sc">recap</span> {recap}
        </p>
      )}

      {currentStep && (
        <pre className="debug-pre">{JSON.stringify(currentStep, null, 2)}</pre>
      )}

      {snapshot && (
        <details className="debug-adapter">
          <summary>Adapter state <span className="tabular">({domain})</span></summary>
          <pre className="debug-pre">{JSON.stringify(snapshot, null, 2)}</pre>
        </details>
      )}

      <div className="field-row">
        <button type="button" className="btn" onClick={handleExport} disabled={!steps.length}>
          Export trace
        </button>
      </div>
    </details>
  );
}
