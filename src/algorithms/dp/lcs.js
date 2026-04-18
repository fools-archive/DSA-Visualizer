import { dpUpdate, dpHighlight, dpTrace, note } from '../../engine/stepTypes.js';

// Longest common subsequence. dp[i][j] = LCS length of a[..i] vs b[..j].
// Row 0 / col 0 are the empty-prefix base cases.
export function lcs({ a, b }) {
  const n = a.length;
  const m = b.length;
  const steps = [];
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  steps.push(note(`LCS: "${a}" vs "${b}"`));
  for (let j = 0; j <= m; j++) steps.push(dpUpdate(0, j, 0));
  for (let i = 1; i <= n; i++) steps.push(dpUpdate(i, 0, 0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      steps.push(dpHighlight(i, j));
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push(dpUpdate(i, j, dp[i][j], [[i - 1, j - 1]]));
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push(dpUpdate(i, j, dp[i][j], [[i - 1, j], [i, j - 1]]));
      }
    }
  }

  // reconstruct
  let i = n, j = m;
  const out = [];
  while (i > 0 && j > 0) {
    steps.push(dpTrace(i, j));
    if (a[i - 1] === b[j - 1]) {
      out.push(a[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  const seq = out.reverse().join('');
  steps.push(note(`LCS length ${dp[n][m]} — "${seq}"`));

  return { steps, rows: n + 1, cols: m + 1, meta: { a, b, length: dp[n][m], sequence: seq } };
}
