import { formatStep } from '../engine/stepFormat.js';

export default function PlayerControls({ player }) {
  const { playing, index, totalSteps, empty, speed, controls, currentStep } = player;
  const atEnd = index >= totalSteps;
  return (
    <div className="player">
      <div className="player-controls">
        <button className="btn ghost" onClick={controls.reset} disabled={empty || index === 0} aria-label="Reset">
          ⏮
        </button>
        <button className="btn" onClick={controls.stepBackward} disabled={empty || index === 0} aria-label="Step back">
          ←
        </button>
        {!playing ? (
          <button className="btn primary" onClick={controls.play} disabled={empty || atEnd}>
            Play
          </button>
        ) : (
          <button className="btn" onClick={controls.pause}>Pause</button>
        )}
        <button className="btn" onClick={controls.stepForward} disabled={empty || atEnd} aria-label="Step forward">
          →
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
      <div className="player-scrubber">
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps)}
          step="1"
          value={index}
          onChange={(e) => controls.jumpToIndex(Number(e.target.value))}
          disabled={empty}
          aria-label="Scrub to step"
        />
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
