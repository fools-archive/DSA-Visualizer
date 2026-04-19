# Architecture

A map of the layers and the contracts between them, written so a future
contributor (or your future self) can extend the system without
understanding every file.

## The four layers

```
 algorithms/   →  pure functions. emit step[] or { steps, state, ... }.
    │               no React, no DOM, no randomness.
    ▼
 engine/       →  usePlayer, metrics, persistence, trace, useComparison.
    │               owns the index, not the view.
    ▼
 visualizers/  →  SVG canvases. reduce(steps.slice(0, index)) → frame.
    │               pure-ish React components; no internal play state.
    ▼
 pages/        →  React pages wire the three layers and add page chrome.
                    handle URL snapshots here — not in the engine.
```

**The invariant:** `view(t) = reduce(initialState, steps[0..t])`. Because
algorithms are deterministic and canvases are pure reducers, backward and
jump-to-index are free — we only mutate `index`, never reverse a step.

## Step events

Every event is a plain object with a `type` discriminator. Factories live in
`src/engine/stepTypes.js`; display strings in `src/engine/stepFormat.js`;
counters in `src/engine/metrics.js`. Never construct a step literal inline —
route it through a factory so the three files stay in sync.

Current families:

| Family     | Example types                            | Visualizer       |
| ---------- | ---------------------------------------- | ---------------- |
| sorting    | `compare`, `swap`, `overwrite`, `pivot`  | SortingCanvas    |
| trees      | `visit`, `insert`, `delete`, `rotate-*`  | TreeCanvas       |
| graphs     | `visit-node`, `traverse-edge`, `relax`   | GraphCanvas      |
| heap       | `heap-compare`, `heap-insert`, ...       | HeapCanvas       |
| union-find | `uf-find`, `uf-union`, `uf-compress`     | UnionFindCanvas  |
| **grid**   | `grid-frontier`, `grid-visit`, `grid-path` | GridCanvas     |
| **dp**     | `dp-update` (with `deps`), `dp-highlight`, `dp-trace` | DPCanvas |

## Adding a new algorithm (to an existing family)

1. Drop the module under `src/algorithms/<category>/<name>.js`. Export a
   pure function `(input) => Step[]` (or `(state, ...) => { steps, state }`
   for mutating structures).
2. Use only the factory imports from `engine/stepTypes.js`.
3. Add an entry to the relevant array in `src/algorithms/registry.js`.
4. Pages read the registry — no further edits needed.

## Adding a new family (new structure / new step types)

1. Add factories to `stepTypes.js` and display strings to `stepFormat.js`.
2. Teach `metrics.js` which types increment which counters; add a
   `metricFieldsByCategory` entry.
3. Write a canvas that reduces the new step types. Canvases must be pure
   reducers over `steps.slice(0, index)` — no timers, no play state.
4. Write a page that wires `usePlayer`, the canvas, and a `MetricsPanel`.
5. Add routes in `App.jsx` and nav entries in `Masthead.jsx` /
   `HomePage.jsx`.

## Engine surface

- `usePlayer(initialSteps, { debug, maxSteps })` — indexed playback.
  Returns `{ steps, index, playing, controls, ... }`. `maxSteps` caps
  the stream (default `MAX_STEPS = 50000`) so a buggy emitter can't hang
  the UI.
- `useComparison(playerA, playerB, { defaultLocked })` — drives two
  players in lockstep when `locked` is true; otherwise each plays free.
- `computeMetrics(steps, upTo)` — pure reducer. Call from `useMemo`.
- `persistence.js` — `encodeState` / `decodeState` for
  `{ category, algoId, input, index }` snapshots;
  `readSnapshotFromHash` / `writeSnapshotToHash` / `buildShareUrl` wrap
  the URL fragment. Reconstruction is deterministic: the page regenerates
  the steps from `(algoId, input)` and jumps to `index`.
- `trace.js` — `buildTrace` + `downloadTrace` dumps the full step sequence
  as JSON for offline inspection or regression fixtures.

## Extensibility guardrails

- **No side effects in algorithms.** Random inputs must be generated in
  the page and passed in; the algorithm itself receives fully realized
  data. This is what makes traces reproducible and snapshots sharable.
- **Canvases never store play state.** If you need "this just changed"
  styling, derive it from `index === steps.length - 1` inside the reducer.
- **Metrics derive, never count in-place.** Don't mutate counters inside
  an algorithm — the reducer in `metrics.js` is the single source of
  truth so forward/backward/jump all show the same numbers.
- **One accent, used sparingly.** Grid and DP canvases read the same CSS
  custom properties (`--accent`, `--state-visited`, etc.) as every other
  canvas so the editorial palette stays coherent.

## Files added in Phase 3

```
src/
  engine/
    persistence.js         — URL snapshot encode/decode
    trace.js               — step-stream export
    useComparison.js       — two-player lockstep coordinator
  algorithms/
    grid/
      sampleGrid.js        — grid model + default grid
      gridBfs.js
      gridDijkstra.js
      gridAstar.js
    dp/
      fibonacci.js         — tabulation + memoization
      knapsack.js          — 0/1 knapsack with backtrace
      lcs.js               — LCS with reconstruction
  visualizers/
    GridCanvas.jsx         — wall-click-to-toggle grid renderer
    DPCanvas.jsx           — 1D/2D table with dependency arrows
  components/
    SnapshotShare.jsx      — copy-share-link button
  pages/
    GridPage.jsx
    DPPage.jsx
    ComparePage.jsx
```

## Phase 4 additions — system unification & intelligent layers

Phase 4 refines (does not rewrite) the engine. New primitives:

### Unified step schema — `engine/schema.js`

Canonical shape:

```js
{ kind: 'operation' | 'annotation',
  domain: 'array' | 'tree' | 'graph' | 'grid' | 'dp' | 'shared',
  action: string,
  payload: object }
```

- `toUnified(step)` — normalizes legacy `{type, ...}` or canonical steps.
- `makeStep(domain, action, payload)` — forward-looking factory; emits
  both the new fields and the legacy flat projection so existing canvases
  keep working without a single edit.
- `TYPE_TABLE` — maps every known legacy `type` to `(domain, action, kind)`.

### Domain adapters — `engine/adapters/`

Each domain (array, tree, graph, grid, dp) ships an adapter with a tiny
interface:

```js
adapter.initialize(input)   // seed from the algorithm's input
adapter.applyStep(step)     // mutate internal state
adapter.getState()          // plain-object snapshot (safe to serialize)
adapter.reset()             // back to freshly-initialized
adapter.clone()             // independent copy (for the comparison engine)
adapter.__restore(snap)     // rehydrate from a snapshot
```

Adapters centralize the reducer logic canvases used to inline, and they
give the checkpoint system a domain-agnostic "state at step i" primitive.
`getAdapter(domain, config)` from `adapters/index.js` is the registry.

### Checkpointed execution context — `engine/checkpoints.js`

```js
const ctx = createExecutionContext({ domain, steps, input, interval: 50 });
ctx.seekTo(1234);    // O(interval), not O(1234)
ctx.getState();       // adapter snapshot at step 1234
```

Snapshots are built lazily on the first seek past the last checkpoint,
so short runs never pay the cost. `seekTo` finds the nearest snapshot
≤ i and replays ≤ interval steps — turning jump-to-late-step from O(i)
to O(N).

### Explanation layer — `engine/explain.js`

Templates keyed on `"domain/action"`, evaluated over the normalized
payload:

```js
explain({ type: 'swap', indices: [3, 7] })
// "Swapping indices 3 and 7 to restore order."

explainRange(steps, 0, 500)
// "500 steps: 324 × compare, 112 × swap, 20 × mark-sorted."
```

Used by the debug panel and the upcoming execution-trace viewer.
