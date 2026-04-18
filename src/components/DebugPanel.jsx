import { formatStep } from '../engine/stepFormat.js';
import { buildTrace, downloadTrace } from '../engine/trace.js';

// Debug / inspector panel. Accepts optional (category, algoId, input) used
// only for labelling exported trace files.
export default function DebugPanel({ player, category, algoId, input }) {
  const { debug, currentStep, steps, index, totalSteps, controls } = player;

  const prevStep = index > 1 ? steps[index - 2] : null;
  const nextStep = index < steps.length ? steps[index] : null;

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
        <pre className="debug-pre">{JSON.stringify(currentStep, null, 2)}</pre>
      )}

      <div className="field-row">
        <button type="button" className="btn" onClick={handleExport} disabled={!steps.length}>
          Export trace
        </button>
      </div>
    </details>
  );
}
