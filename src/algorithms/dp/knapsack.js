import { dpUpdate, dpHighlight, dpTrace, note } from '../../engine/stepTypes.js';

// 0/1 Knapsack. dp[i][w] = best value using first i items with capacity w.
// Rows are items (1..n) with row 0 as the empty-selection base. Cols are
// capacities 0..W.
export function knapsack({ weights, values, capacity }) {
  const n = weights.length;
  const W = capacity | 0;
  const steps = [];
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  steps.push(note(`Knapsack: ${n} items, capacity ${W}`));
  // base row
  for (let w = 0; w <= W; w++) steps.push(dpUpdate(0, w, 0));

  for (let i = 1; i <= n; i++) {
    const wi = weights[i - 1];
    const vi = values[i - 1];
    for (let w = 0; w <= W; w++) {
      steps.push(dpHighlight(i, w));
      if (wi > w) {
        dp[i][w] = dp[i - 1][w];
        steps.push(dpUpdate(i, w, dp[i][w], [[i - 1, w]]));
      } else {
        const take = dp[i - 1][w - wi] + vi;
        const skip = dp[i - 1][w];
        dp[i][w] = Math.max(take, skip);
        steps.push(dpUpdate(i, w, dp[i][w], [[i - 1, w], [i - 1, w - wi]]));
      }
    }
  }

  // backtrace selected items
  const chosen = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.push(i - 1);
      steps.push(dpTrace(i, w));
      w -= weights[i - 1];
    } else {
      steps.push(dpTrace(i, w));
    }
  }
  steps.push(note(`Best value = ${dp[n][W]}; items = [${chosen.reverse().join(', ')}]`));

  return { steps, rows: n + 1, cols: W + 1, meta: { weights, values, capacity: W, best: dp[n][W] } };
}
