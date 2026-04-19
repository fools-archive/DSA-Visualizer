// useAdapterSnapshot — returns the adapter-reduced state at the player's
// current index, using a checkpointed execution context so backward/jump
// stays O(checkpoint-interval) rather than O(index).
//
// Usage:
//   const snap = useAdapterSnapshot({ domain:'array', steps, input, index });
//
// The context is rebuilt whenever (domain, steps, input) change. `index`
// only drives a `seekTo` — the context keeps its checkpoint table warm
// across renders.

import { useMemo, useRef } from 'react';
import { createExecutionContext } from './checkpoints.js';

export default function useAdapterSnapshot({ domain, steps, input, index, config, interval }) {
  const ctxRef = useRef(null);

  const ctx = useMemo(() => {
    if (!domain || !Array.isArray(steps)) return null;
    try {
      const built = createExecutionContext({ domain, steps, input, config, interval });
      ctxRef.current = built;
      return built;
    } catch {
      ctxRef.current = null;
      return null;
    }
  }, [domain, steps, input, config, interval]);

  return useMemo(() => {
    if (!ctx) return null;
    try {
      ctx.seekTo(index);
      return ctx.getState();
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, index]);
}
