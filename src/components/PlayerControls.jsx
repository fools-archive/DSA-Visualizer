export default function PlayerControls({ player }) {
  const { playing, index, totalSteps, empty, speed, controls, currentStep } = player;
  const atEnd = index >= totalSteps;
  return (
    <div className="player">
      <div className="player-controls">
        {!playing ? (
          <button className="btn primary" onClick={controls.play} disabled={empty || atEnd}>
            Play
          </button>
        ) : (
          <button className="btn" onClick={controls.pause}>Pause</button>
        )}
        <button className="btn" onClick={controls.stepBackward} disabled={empty || index === 0} aria-label="Step back">
          ←
        </button>
        <button className="btn" onClick={controls.stepForward} disabled={empty || atEnd} aria-label="Step forward">
          →
        </button>
        <button className="btn ghost" onClick={controls.reset} disabled={empty || index === 0}>
          Reset
        </button>
        <span className="spacer" />
        <label className="speed">
          Tempo
          <input
            type="range"
            min="50"
            max="1200"
            step="50"
            value={1250 - speed}
            onChange={(e) => controls.setSpeed(1250 - Number(e.target.value))}
          />
        </label>
        <span className="progress">
          {String(index).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </span>
      </div>
      <div className="step-readout">
        {currentStep
          ? formatStep(currentStep)
          : empty
          ? <span className="muted">No steps loaded — choose parameters at left.</span>
          : <span className="muted">Ready. Press Play or Step → to begin.</span>}
      </div>
    </div>
  );
}

function formatStep(s) {
  switch (s.type) {
    case 'compare': return `compare(${s.indices.join(', ')})`;
    case 'swap': return `swap(${s.indices.join(', ')})`;
    case 'overwrite': return `overwrite(index=${s.index}, value=${s.value})`;
    case 'mark-sorted': return `mark-sorted(${s.index})`;
    case 'visit': return `visit node ${s.nodeId}`;
    case 'compare-node': return `compare at node ${s.nodeId} with ${s.value}`;
    case 'insert': return `insert ${s.value} as ${s.side} child of ${s.parentId ?? 'root'}`;
    case 'delete': return `delete node ${s.nodeId}`;
    case 'replace-value': return `replace value at ${s.nodeId} → ${s.value}`;
    case 'visit-node': return `visit ${s.nodeId}`;
    case 'traverse-edge': return `traverse ${s.from} → ${s.to}`;
    case 'enqueue': return `enqueue ${s.nodeId}`;
    case 'dequeue': return `dequeue ${s.nodeId}`;
    case 'push': return `push ${s.nodeId}`;
    case 'pop': return `pop ${s.nodeId}`;
    case 'note': return s.message;
    default: return JSON.stringify(s);
  }
}
