import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * usePlayer — indexes into a deterministic step array.
 *
 * Rendering is driven by `index`; visualizers reduce steps[0..index] to a view.
 */
export default function usePlayer(initialSteps = []) {
  const [steps, setSteps] = useState(initialSteps);
  const [index, setIndex] = useState(0); // number of steps applied
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400); // ms per step

  const timerRef = useRef(null);
  const indexRef = useRef(index);
  const stepsRef = useRef(steps);
  const speedRef = useRef(speed);
  indexRef.current = index;
  stepsRef.current = steps;
  speedRef.current = speed;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const tick = useCallback(() => {
    if (indexRef.current >= stepsRef.current.length) {
      setPlaying(false);
      return;
    }
    setIndex((i) => i + 1);
    timerRef.current = setTimeout(tick, speedRef.current);
  }, []);

  useEffect(() => {
    if (!playing) {
      clearTimer();
      return;
    }
    if (index >= steps.length) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(tick, speedRef.current);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => clearTimer, []);

  const loadSteps = useCallback((newSteps) => {
    clearTimer();
    setSteps(newSteps || []);
    setIndex(0);
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    if (indexRef.current >= stepsRef.current.length) setIndex(0);
    setPlaying(true);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, stepsRef.current.length));
  }, []);

  const stepBackward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  const currentStep = index > 0 ? steps[index - 1] : null;

  return {
    steps,
    index,
    playing,
    speed,
    currentStep,
    totalSteps: steps.length,
    done: steps.length > 0 && index >= steps.length,
    empty: steps.length === 0,
    controls: { play, pause, stepForward, stepBackward, reset, setSpeed, loadSteps }
  };
}
