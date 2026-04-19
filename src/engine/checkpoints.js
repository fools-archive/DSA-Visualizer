// Checkpoint-based execution context.
//
// Problem: the engine's invariant is `view = reduce(steps[0..index])`.
// Recomputing from index 0 on every frame is O(index) and jumping to a
// late step in a 10k-step run is visibly slow.
//
// Solution: every N steps, snapshot the adapter's state. To get state at
// step i, find the nearest checkpoint ≤ i and replay the gap — at most
// N steps of work instead of i.
//
// Usage:
//   const ctx = createExecutionContext({ domain: 'array', steps, input });
//   ctx.seekTo(1234);            // fast — uses checkpoints
//   ctx.getState();               // adapter snapshot at step 1234
//   ctx.getIndex();
//
// Checkpoints are built lazily on the first seek past the last checkpoint
// so short runs never pay the snapshot cost.

import { getAdapter } from './adapters/index.js';

export const DEFAULT_INTERVAL = 50;

export function createExecutionContext({
  domain,
  steps = [],
  input = null,
  config = undefined,
  interval = DEFAULT_INTERVAL,
}) {
  const adapter = getAdapter(domain, config);
  adapter.initialize(input);

  // Anchor at index 0 (pre-step). Snapshots are stored at indices
  // interval, 2*interval, ... — `checkpoints[k]` is the state AFTER
  // applying steps[0..k*interval).
  const checkpoints = [adapter.getState()];
  let currentIndex = 0;

  function ensureCheckpointsThrough(targetIndex) {
    const targetCkpt = Math.floor(targetIndex / interval);
    while (checkpoints.length - 1 < targetCkpt) {
      const ckptIdx = checkpoints.length;
      const from = (ckptIdx - 1) * interval;
      const to = ckptIdx * interval;
      // Build next checkpoint by replaying `interval` steps from the
      // previous one.
      adapter.__restore(checkpoints[ckptIdx - 1]);
      for (let i = from; i < to && i < steps.length; i++) {
        adapter.applyStep(steps[i]);
      }
      checkpoints.push(adapter.getState());
      if (to >= steps.length) break;
    }
  }

  function seekTo(targetIndex) {
    const clamped = Math.max(0, Math.min(targetIndex, steps.length));
    ensureCheckpointsThrough(clamped);
    const ckptIdx = Math.min(Math.floor(clamped / interval), checkpoints.length - 1);
    adapter.__restore(checkpoints[ckptIdx]);
    const from = ckptIdx * interval;
    for (let i = from; i < clamped; i++) {
      adapter.applyStep(steps[i]);
    }
    currentIndex = clamped;
  }

  return {
    domain,
    getIndex: () => currentIndex,
    getTotal: () => steps.length,
    getState: () => adapter.getState(),
    getAdapter: () => adapter,
    getStep: (i = currentIndex - 1) =>
      (i >= 0 && i < steps.length ? steps[i] : null),
    seekTo,
    next: () => seekTo(currentIndex + 1),
    prev: () => seekTo(currentIndex - 1),
    reset: () => seekTo(0),
    // Diagnostics.
    checkpointCount: () => checkpoints.length,
    interval,
  };
}
