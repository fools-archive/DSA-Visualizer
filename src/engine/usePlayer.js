import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatStep } from './stepFormat.js';

/**
 * usePlayer — indexes into a deterministic step array.
 *
 * Invariant: view = reduce(steps[0..index]). Algorithms are pure; canvases
 * recompute from the array each render. That makes backward/jump free — we
 * only mutate `index`, never reverse individual steps.
 */
// Hard cap on step-stream length. Algorithms that misbehave and emit an
// unbounded sequence will be truncated here rather than hanging the UI.
export const MAX_STEPS = 50000;

export default function usePlayer(initialSteps = [], options = {}) {
  const { debug = false, maxSteps = MAX_STEPS } = options;

  const [steps, setSteps] = useState(initialSteps);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [debugEnabled, setDebugEnabled] = useState(debug);

  const timerRef = useRef(null);
  const indexRef = useRef(index);
  const stepsRef = useRef(steps);
  const speedRef = useRef(speed);
  const playStartRef = useRef(null);
  const baselineElapsedRef = useRef(0);
  const debugRef = useRef(debugEnabled);
  indexRef.current = index;
  stepsRef.current = steps;
  speedRef.current = speed;
  debugRef.current = debugEnabled;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const logStep = useCallback((step, i) => {
    if (!debugRef.current || !step) return;
    // eslint-disable-next-line no-console
    console.log(`[${String(i).padStart(3, '0')}] ${formatStep(step)}`, step);
  }, []);

  const tick = useCallback(() => {
    if (indexRef.current >= stepsRef.current.length) {
      setPlaying(false);
      return;
    }
    setIndex((i) => {
      const next = i + 1;
      logStep(stepsRef.current[next - 1], next);
      return next;
    });
    timerRef.current = setTimeout(tick, speedRef.current);
  }, [logStep]);

  useEffect(() => {
    if (!playing) {
      clearTimer();
      if (playStartRef.current != null) {
        baselineElapsedRef.current += performance.now() - playStartRef.current;
        setElapsedMs(baselineElapsedRef.current);
        playStartRef.current = null;
      }
      return;
    }
    if (index >= steps.length) {
      setPlaying(false);
      return;
    }
    playStartRef.current = performance.now();
    timerRef.current = setTimeout(tick, speedRef.current);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => clearTimer, []);

  const loadSteps = useCallback((newSteps) => {
    clearTimer();
    let safe = newSteps || [];
    if (safe.length > maxSteps) {
      // eslint-disable-next-line no-console
      console.warn(`[usePlayer] step stream exceeded MAX_STEPS (${safe.length} > ${maxSteps}); truncating.`);
      safe = [
        ...safe.slice(0, maxSteps),
        { type: 'note', message: `Truncated at ${maxSteps} steps — possible loop.` },
      ];
    }
    setSteps(safe);
    setIndex(0);
    setPlaying(false);
    setElapsedMs(0);
    baselineElapsedRef.current = 0;
    playStartRef.current = null;
  }, [maxSteps]);

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    if (indexRef.current >= stepsRef.current.length) {
      setIndex(0);
      baselineElapsedRef.current = 0;
      setElapsedMs(0);
    }
    setPlaying(true);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => {
      const next = Math.min(i + 1, stepsRef.current.length);
      if (next !== i) logStep(stepsRef.current[next - 1], next);
      return next;
    });
  }, [logStep]);

  const stepBackward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
    baselineElapsedRef.current = 0;
    setElapsedMs(0);
    playStartRef.current = null;
  }, []);

  const jumpToIndex = useCallback((n) => {
    setPlaying(false);
    const clamped = Math.max(0, Math.min(Number(n) || 0, stepsRef.current.length));
    setIndex(clamped);
  }, []);

  const toggleDebug = useCallback(() => setDebugEnabled((v) => !v), []);

  const currentStep = index > 0 ? steps[index - 1] : null;

  const controls = useMemo(
    () => ({
      play,
      pause,
      stepForward,
      stepBackward,
      reset,
      setSpeed,
      loadSteps,
      jumpToIndex,
      toggleDebug,
    }),
    [play, pause, stepForward, stepBackward, reset, loadSteps, jumpToIndex, toggleDebug]
  );

  return {
    steps,
    index,
    playing,
    speed,
    currentStep,
    totalSteps: steps.length,
    done: steps.length > 0 && index >= steps.length,
    empty: steps.length === 0,
    elapsedMs,
    debug: debugEnabled,
    controls,
  };
}
