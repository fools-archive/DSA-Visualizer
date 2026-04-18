// useComparison — thin coordinator over two usePlayer instances. In
// `locked` mode the returned controls drive BOTH players in lockstep;
// in `free` mode each player's own PlayerControls drive it independently.
// The players themselves are passed in from the page (one hook call each)
// — we don't instantiate them here so each can be wired to its own steps.

import { useCallback, useEffect, useRef, useState } from 'react';

export default function useComparison(playerA, playerB, options = {}) {
  const { defaultLocked = true } = options;
  const [locked, setLocked] = useState(defaultLocked);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  const maxLen = Math.max(playerA.totalSteps, playerB.totalSteps);
  const sharedIndex = Math.max(playerA.index, playerB.index);

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stepBoth = useCallback(() => {
    playerA.controls.stepForward();
    playerB.controls.stepForward();
  }, [playerA, playerB]);

  const stepBackBoth = useCallback(() => {
    playerA.controls.stepBackward();
    playerB.controls.stepBackward();
  }, [playerA, playerB]);

  const resetBoth = useCallback(() => {
    setPlaying(false);
    playerA.controls.reset();
    playerB.controls.reset();
  }, [playerA, playerB]);

  const jumpBoth = useCallback((n) => {
    setPlaying(false);
    playerA.controls.jumpToIndex(n);
    playerB.controls.jumpToIndex(n);
  }, [playerA, playerB]);

  useEffect(() => {
    if (!locked || !playing) {
      stop();
      return;
    }
    const tick = () => {
      // both finished?
      if (playerA.index >= playerA.totalSteps && playerB.index >= playerB.totalSteps) {
        setPlaying(false);
        return;
      }
      stepBoth();
      timerRef.current = setTimeout(tick, speed);
    };
    timerRef.current = setTimeout(tick, speed);
    return stop;
  }, [locked, playing, speed, stepBoth, playerA.index, playerB.index, playerA.totalSteps, playerB.totalSteps]);

  useEffect(() => stop, []);

  return {
    locked,
    setLocked,
    playing,
    speed,
    setSpeed,
    sharedIndex,
    maxLen,
    controls: {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      stepForward: stepBoth,
      stepBackward: stepBackBoth,
      reset: resetBoth,
      jumpToIndex: jumpBoth,
    },
  };
}
