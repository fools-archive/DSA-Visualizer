import { useEffect, useMemo } from 'react';
import usePlayer from '../engine/usePlayer.js';
import { getAlgorithm } from '../algorithms/registry.js';

/**
 * Thin wrapper for the common pattern:
 *    steps = registry[category][id].fn(...args)
 *    player = usePlayer(); loadSteps on change.
 *
 * For the preview/commit tree flow, pages continue to manage steps manually.
 */
export default function useAlgorithmRunner(category, algoId, args, deps = []) {
  const player = usePlayer([]);
  const entry = getAlgorithm(category, algoId);

  const steps = useMemo(
    () => (entry ? entry.fn(...args) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [algoId, ...deps]
  );

  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  return { steps, player, entry };
}
