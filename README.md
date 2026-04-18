# DSA Visualizer

A step-event-driven platform for visualizing data structures and algorithms. Algorithms are pure functions that emit an ordered list of events; a playback engine advances through them; SVG visualizers fold events into a view.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Modules

- **Sorting** — Bubble, Selection, Insertion
- **Trees** — BST insert / delete / inorder / preorder / postorder
- **Graphs** — BFS, DFS on a fixed demo graph

## Architecture

```
src/
  algorithms/   pure (input) => Step[] functions, grouped by category
  engine/       step-type factories + usePlayer hook (play/pause/step/reset/speed)
  visualizers/  SVG components; reduce steps[0..index] into a frame
  components/   Sidebar, PlayerControls, AlgorithmSelect, InputPanel, Legend
  pages/        Home, Sorting, Tree, Graph, About
  styles/       tokens + layout + component CSS
```

### Step model

Algorithms emit events like these — nothing more:

```js
{ type: 'compare', indices: [i, j] }
{ type: 'swap', indices: [i, j] }
{ type: 'overwrite', index: i, value: x }
{ type: 'mark-sorted', index: i }

{ type: 'compare-node', nodeId, value }
{ type: 'insert', nodeId, parentId, value, side }
{ type: 'delete', nodeId }
{ type: 'visit', nodeId }
{ type: 'replace-value', nodeId, value }

{ type: 'visit-node', nodeId }
{ type: 'traverse-edge', from, to }
{ type: 'enqueue' | 'push' | 'dequeue' | 'pop', nodeId }
```

### Adding an algorithm

1. Create `src/algorithms/<category>/yourAlgo.js` exporting a pure function.
2. Use the factories in `src/engine/stepTypes.js` to build the step array.
3. Register the algorithm in the corresponding page's `ALGOS` map.
4. If you introduce a new step type, extend the visualizer's reducer and the readout in `components/PlayerControls.jsx`.

## Extensibility rules

- Algorithms must **not** import from `visualizers/`, `pages/`, or `components/`.
- Visualizers must be **pure** in their props: `steps` + `index` (+ any initial snapshot).
- The player is domain-agnostic: it indexes into an array. That's all.
