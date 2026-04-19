# DSA Visualizer

**Live:** [dsa-visualizer-nu-ten.vercel.app](https://dsa-visualizer-nu-ten.vercel.app/)

A step-event-driven platform for visualizing data structures and algorithms.
Algorithms are pure functions that emit an ordered list of events; a playback
engine advances through them; SVG visualizers fold events into a view.

Presented as a reader rather than a dashboard — chapters, figures, captions,
and a light/dark editorial palette.

---

## Run locally

```bash
npm install
npm run dev      # vite dev server, URL printed on startup
npm run build    # production bundle to dist/
npm run preview  # serve the production bundle
```

Requires Node 18+ (Vite 5 / React 18). No other tooling, no database, no
backend — the whole thing is static.

## Chapters

| # | Chapter | Algorithms |
| -- | ------- | ---------- |
| I | Sorting | Bubble, Selection, Insertion, Merge, Quick, Heap |
| II | Trees | BST insert / delete, in/pre/post order, height, balance |
| III | Graphs | BFS, DFS, Dijkstra, cycle detection |
| IV | Heaps | Min-heap insert / extract-min |
| V | Union-Find | Union by rank, find with path compression |
| VI | Pathfinding | Grid BFS, Dijkstra, A\* (Manhattan) |
| VII | Dynamic programming | Fibonacci (tab / memo), 0/1 Knapsack, LCS |
| VIII | Comparison | Two algorithms side by side, locked or free |

---

## Architecture

Four layers, strict one-way dependency:

```
 algorithms/   →  pure (input) => Step[] functions. no React, no DOM.
    │
    ▼
 engine/       →  playback, schema, adapters, checkpoints,
    │              metrics, persistence, trace, explain, comparison.
    │              owns the index, not the view.
    ▼
 visualizers/  →  SVG canvases. reduce(steps.slice(0, index)) → frame.
    │              pure-ish React; no internal play state.
    ▼
 pages/        →  wire the three layers and add page chrome.
                   handle URL snapshots here, not in the engine.
```

**The invariant:** `view(t) = reduce(initialState, steps[0..t])`. Because
algorithms are deterministic and canvases are pure reducers, backward and
jump-to-index are free — only `index` moves.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full contract and a
step-by-step guide to adding an algorithm or an entirely new family.

---

## The step event model

Every event is a plain object discriminated by `type` (legacy shape) and a
unified `{kind, domain, action, payload}` triple (canonical shape, Phase 4).
Both shapes coexist: `engine/schema.js` normalizes either form on read, and
`makeStep(...)` emits both on write so legacy canvases keep working.

Legacy examples:

```js
{ type: 'compare',       indices: [i, j] }
{ type: 'swap',          indices: [i, j] }
{ type: 'mark-sorted',   index }

{ type: 'visit-node',    nodeId }
{ type: 'traverse-edge', from, to }
{ type: 'relax',         nodeId, newDist, viaEdge }

{ type: 'grid-frontier', r, c }
{ type: 'grid-visit',    r, c }
{ type: 'grid-path',     r, c }

{ type: 'dp-update',     r, c, value, deps }
{ type: 'dp-highlight',  r, c }
```

Canonical (produced by `makeStep`, preferred going forward):

```js
{
  kind:    'operation',      // or 'annotation'
  domain:  'array',          // 'array' | 'tree' | 'graph' | 'grid' | 'dp' | 'shared'
  action:  'swap',
  payload: { indices: [i, j] },
  // legacy mirror — existing canvases keep rendering unchanged:
  type:    'swap',
  indices: [i, j],
}
```

Factories: `src/engine/stepTypes.js`. Display strings: `stepFormat.js`.
Prose explanations: `explain.js`. Counters: `metrics.js`. Add a new type to
all four (plus the adapter for its domain).

---

## Engine surface

### Playback
- **`usePlayer(initialSteps, { debug, maxSteps })`** — indexed playback.
  Returns `{ steps, index, playing, controls, ... }`. `maxSteps` caps the
  stream (default `MAX_STEPS = 50000`) so a runaway emitter can't hang the UI.
- **`useComparison(playerA, playerB, { defaultLocked })`** — drives two
  players in lockstep when `locked` is true; otherwise each plays free.

### Schema & domain adapters (Phase 4)
- **`engine/schema.js`** — unified shape + `toUnified(step)` migration,
  `makeStep(domain, action, payload)` factory, `domainOf` / `kindOf` /
  `actionOf` field extractors. `TYPE_TABLE` maps every legacy `type` string
  to its `(domain, action, kind)` metadata.
- **`engine/adapters/`** — one adapter per domain: `arrayAdapter`,
  `treeAdapter`, `graphAdapter`, `gridAdapter`, `dpAdapter`. Each implements
  `initialize(input)`, `applyStep(step)`, `getState()`, `reset()`,
  `clone()`, `__restore(snap)`. Adapters centralize reducer logic that
  previously lived inside each canvas and give the checkpoint system a
  domain-agnostic "state at step i" primitive.
- **`engine/checkpoints.js`** —
  `createExecutionContext({ domain, steps, input })` snapshots adapter
  state every N steps (default 50, lazy). `seekTo(i)` restores the nearest
  checkpoint and replays ≤ N steps, turning backward / jump from O(i) into
  O(N).

### Explanation & metrics
- **`engine/explain.js`** — `explain(step)` returns deterministic English
  prose for any step; `explainRange(steps, lo, hi)` summarizes a slice as
  `"N steps: 42 × compare, 17 × swap, ..."`.
- **`engine/metrics.js`** — pure reducer over the executed prefix;
  `computeMetrics(steps, upTo)` is the single source of truth so
  forward / backward / jump all produce identical numbers.

### Persistence & export
- **`engine/persistence.js`** — `encodeState` / `decodeState` for
  `{ category, algoId, input, index }` snapshots plus the
  `readSnapshotFromHash` / `writeSnapshotToHash` / `buildShareUrl` URL
  wrappers. Reconstruction is deterministic: the page regenerates the steps
  from `(algoId, input)` and jumps to `index`.
- **`engine/trace.js`** — `buildTrace` + `downloadTrace` dumps the full
  step sequence as JSON for offline inspection or regression fixtures.

---

## Directory map

```
src/
  algorithms/
    sorting/        bubble, selection, insertion, merge, quick, heap
    trees/          bst, traversals
    graphs/         bfs, dfs, dijkstra, cycleDetect, sampleGraph
    heap/           minHeap
    unionFind/      unionFind
    grid/           gridBfs, gridDijkstra, gridAstar, sampleGrid
    dp/             fibonacci, knapsack, lcs
    registry.js     single source of truth for UI dropdowns
  engine/
    usePlayer.js         indexed playback + MAX_STEPS guard
    useComparison.js     lockstep / free two-player coordinator
    schema.js            unified step shape + legacy migration
    adapters/            array, tree, graph, grid, dp adapters + registry
    checkpoints.js       snapshot-every-N execution context
    explain.js           prose templates for every (domain, action)
    metrics.js           pure counters reducer
    persistence.js       URL-hash snapshots + share URLs
    trace.js             JSON step-stream export
    stepTypes.js         legacy step factories
    stepFormat.js        one-line display strings for the debug panel
  visualizers/           SortingCanvas, TreeCanvas, GraphCanvas, HeapCanvas,
                         UnionFindCanvas, GridCanvas, DPCanvas
  components/            Masthead, PlayerControls, MetricsPanel, DebugPanel,
                         InputPanel, Legend, AlgorithmSelect, ThemeToggle,
                         SnapshotShare, Sidebar
  pages/                 HomePage, SortingPage, TreePage, GraphPage,
                         HeapPage, UnionFindPage, GridPage, DPPage,
                         ComparePage, AboutPage
  styles/                tokens.css (OKLCH palette, type scale),
                         layout.css, components.css
  hooks/                 useAlgorithmRunner
  utils/                 random
```

---

## Extending the system

### Adding an algorithm (existing family)

1. Drop `src/algorithms/<category>/<name>.js`. Export a pure function
   `(input) => Step[]` (or `(state, ...) => { steps, state }` for mutating
   structures).
2. Emit events via factories from `engine/stepTypes.js` or, for new steps,
   `makeStep(domain, action, payload)` from `engine/schema.js`.
3. Register it in `src/algorithms/registry.js`. Pages read the registry.

### Adding a family (new structure / new step types)

1. Add factories to `stepTypes.js`, display strings to `stepFormat.js`,
   explanation templates to `explain.js`, an entry to `TYPE_TABLE` in
   `schema.js`, counter rules to `metrics.js`.
2. Write (or extend) an adapter under `engine/adapters/` and register it
   in `adapters/index.js`.
3. Write a canvas that reduces the new step types. Canvases must be pure
   reducers over `steps.slice(0, index)` — no timers, no play state.
4. Write a page that wires `usePlayer`, the canvas, a `MetricsPanel`.
5. Add a route in `App.jsx` and nav entries in `Masthead.jsx` /
   `HomePage.jsx`.

---

## Design language

The interface is shaped like a printed reader, not a SaaS dashboard.

- **Editorial type.** One distinctive display face paired with one refined
  text face. 1.25+ modular scale. Small caps for metadata, tabular figures
  inside the visualizers, oldstyle figures in body copy.
- **OKLCH palette with a single accent** used sparingly (≈10% of visual
  weight). Both light and dark themes are first-class; neither is an
  inversion of the other. Both tint neutrals slightly toward the accent
  hue for cohesion.
- **Algorithms as specimens.** Each visualization is a numbered figure
  with a caption. Rules and whitespace do the work that cards and shadows
  do elsewhere.
- **Motion serves comprehension.** 180–320ms ease-out transitions on
  transform/opacity only. No parallax, no page-load flourishes, no
  micro-interactions on chrome.

---

## Guardrails

- Algorithms must **not** import from `visualizers/`, `pages/`, or
  `components/`.
- Canvases must be **pure** in their props (`steps` + `index` + any
  initial snapshot). No timers, no play state inside a canvas.
- Metrics and display strings **derive**, never count in-place inside an
  algorithm.
- Random inputs are generated in the page and passed in; the algorithm
  itself receives fully realized data. That is what makes traces
  reproducible and snapshots sharable.
- The player is domain-agnostic: it indexes into an array. That is all.

---

## Roadmap

- **Phase 4 (in progress):** unified schema, domain adapters,
  checkpointed execution context, explanation layer — all landed.
  Remaining: wire the execution context into `usePlayer` for O(N) seek;
  step-inspector panel surfacing `explain(step)` + adapter snapshot;
  execution-trace viewer using `explainRange`.
- **Phase 5 (planned):** algorithm authoring playground; diff view for
  comparison mode; expanded tree family (AVL, red-black).

## License

MIT.
