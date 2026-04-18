# DSA Visualizer

A step-event-driven platform for visualizing data structures and algorithms.
Algorithms are pure functions that emit an ordered list of events; a playback
engine advances through them; SVG visualizers fold events into a view.

Presented as a reader rather than a dashboard — chapters, figures, captions,
and a light/dark editorial palette.

## Run locally

```bash
npm install
npm run dev
```

The dev server prints its URL on startup.

To build the production bundle:

```bash
npm run build
```

## Chapters

| # | Chapter | Algorithms |
| - | ------- | ---------- |
| I | Sorting | Bubble, Selection, Insertion, Merge, Quick, Heap |
| II | Trees | BST insert / delete, in/pre/post order, height, balance |
| III | Graphs | BFS, DFS, Dijkstra, cycle detection |
| IV | Heaps | Min-heap insert / extract-min |
| V | Union-Find | Union by rank, find with path compression |
| VI | Pathfinding | Grid BFS, Dijkstra, A* (Manhattan) |
| VII | Dynamic programming | Fibonacci (tab / memo), 0/1 Knapsack, LCS |
| VIII | Comparison | Two sorting algorithms side by side, locked or free |

## Architecture (in brief)

```
src/
  algorithms/   pure (input) => Step[] functions, grouped by category
  engine/       usePlayer, metrics, persistence, trace, useComparison
  visualizers/  SVG components; reduce steps[0..index] into a frame
  components/   Masthead, PlayerControls, panels, inputs
  pages/        One page per chapter
  styles/       Editorial tokens + components
```

The invariant: `view(t) = reduce(initialState, steps[0..t])`. Algorithms are
deterministic and canvases are pure reducers, so backward / jump-to-index
are free — only `index` moves.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full contract, step-type
families, engine surface, and a step-by-step guide to adding an algorithm or
an entirely new family.

### Step model (excerpt)

```js
{ type: 'compare', indices: [i, j] }
{ type: 'swap', indices: [i, j] }
{ type: 'overwrite', index, value }
{ type: 'mark-sorted', index }

{ type: 'visit-node', nodeId }
{ type: 'traverse-edge', from, to }
{ type: 'relax', nodeId, newDist, viaEdge }

{ type: 'grid-frontier', r, c }
{ type: 'grid-visit', r, c }
{ type: 'grid-path', r, c }

{ type: 'dp-update', r, c, value, deps }
{ type: 'dp-highlight', r, c }
```

Factories live in `src/engine/stepTypes.js`; display strings in
`src/engine/stepFormat.js`; counters in `src/engine/metrics.js`. Add a new
type to all three.

### Adding an algorithm

1. Create `src/algorithms/<category>/yourAlgo.js` exporting a pure function.
2. Build its step array via the factories in `src/engine/stepTypes.js`.
3. Register it in `src/algorithms/registry.js`.
4. If you introduce a new step type, extend `stepFormat.js`, `metrics.js`,
   and the relevant canvas reducer.

## Engine features

- **Indexed playback** (`usePlayer`) — play / pause / step / jump, with
  `MAX_STEPS` cap so a buggy emitter can't hang the UI.
- **Comparison** (`useComparison`) — drive two players in lockstep on the
  same input, or let each play independently.
- **Persistence** (`engine/persistence.js`) — `{category, algoId, input,
  index}` snapshots encoded into a URL hash fragment; deterministic
  reconstruction.
- **Trace export** (`engine/trace.js`) — dump the full step sequence as
  JSON for inspection or regression fixtures.
- **Metrics** (`engine/metrics.js`) — pure reducer over the executed
  prefix; forward / backward / jump all produce the same numbers.

## Extensibility rules

- Algorithms must **not** import from `visualizers/`, `pages/`, or
  `components/`.
- Visualizers must be **pure** in their props (`steps` + `index` + any
  initial snapshot). No timers, no play state inside a canvas.
- Metrics and display strings **derive**, never count in-place inside an
  algorithm.
- The player is domain-agnostic: it indexes into an array. That's all.
