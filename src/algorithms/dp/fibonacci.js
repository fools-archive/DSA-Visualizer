import { dpUpdate, dpHighlight, note } from '../../engine/stepTypes.js';

// Tabulation. Emits a single 1-row, (n+1)-column DP table. Each cell after
// the base cases depends on [0, i-1] and [0, i-2] — the canvas draws
// dependency lines back to those.
export function fibTabulation(n) {
  const steps = [];
  const N = Math.max(0, Math.min(30, n | 0));
  steps.push(note(`Tabulation: dp[i] = dp[i-1] + dp[i-2], build 0..${N}`));
  const dp = new Array(N + 1).fill(0);
  steps.push(dpUpdate(0, 0, 0));
  if (N >= 1) { dp[1] = 1; steps.push(dpUpdate(0, 1, 1)); }
  for (let i = 2; i <= N; i++) {
    steps.push(dpHighlight(0, i));
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push(dpUpdate(0, i, dp[i], [[0, i - 1], [0, i - 2]]));
  }
  return { steps, rows: 1, cols: N + 1, meta: { n: N } };
}

// Recursion-with-memo. Same table shape; writes happen as the recursion
// unwinds, which is visibly different from the left-to-right tabulation.
export function fibMemo(n) {
  const steps = [];
  const N = Math.max(0, Math.min(30, n | 0));
  steps.push(note(`Top-down: recurse then memoize, target = ${N}`));
  const dp = new Array(N + 1).fill(-1);
  function rec(i) {
    if (i <= 1) {
      if (dp[i] === -1) {
        dp[i] = i;
        steps.push(dpUpdate(0, i, i));
      }
      return dp[i];
    }
    if (dp[i] !== -1) return dp[i];
    steps.push(dpHighlight(0, i));
    const a = rec(i - 1);
    const b = rec(i - 2);
    dp[i] = a + b;
    steps.push(dpUpdate(0, i, dp[i], [[0, i - 1], [0, i - 2]]));
    return dp[i];
  }
  rec(N);
  return { steps, rows: 1, cols: N + 1, meta: { n: N } };
}
