import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import Legend from '../components/Legend.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import GridCanvas from '../visualizers/GridCanvas.jsx';
import { defaultGrid, toggleWall } from '../algorithms/grid/sampleGrid.js';
import gridBfs from '../algorithms/grid/gridBfs.js';
import gridDijkstra from '../algorithms/grid/gridDijkstra.js';
import gridAstar from '../algorithms/grid/gridAstar.js';

const ALGOS = {
  bfs:      { label: 'BFS',      fn: gridBfs,      complexity: 'O(V + E)' },
  dijkstra: { label: 'Dijkstra', fn: gridDijkstra, complexity: 'O(V log V)' },
  astar:    { label: 'A*',       fn: gridAstar,    complexity: 'O(V log V)' },
};

export default function GridPage() {
  const [algo, setAlgo] = useState('bfs');
  const [grid, setGrid] = useState(defaultGrid);
  const [editWalls, setEditWalls] = useState(false);
  const player = usePlayer([]);

  const steps = useMemo(() => ALGOS[algo].fn(grid), [algo, grid]);
  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const handleToggle = (r, c) => {
    const isEndpoint = (grid.start[0] === r && grid.start[1] === c) ||
      (grid.end[0] === r && grid.end[1] === c);
    if (isEndpoint) return;
    setGrid((g) => toggleWall(g, r, c));
  };

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter VI</span>
          <span className="chapter-tag">— grids &amp; shortest paths</span>
        </div>
        <h1>Pathfinding.</h1>
        <p className="dek">
          The same terrain, three temperaments. <em>BFS</em> expands in rings;
          <em> Dijkstra</em> orders by accumulated cost; <em>A*</em> pulls toward
          the goal with a Manhattan heuristic.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Parameters</h3>
              <span className="section-num">§ 6.1</span>
            </div>
            <AlgorithmSelect
              label="Method"
              value={algo}
              onChange={setAlgo}
              options={Object.entries(ALGOS).map(([v, a]) => ({ value: v, label: a.label }))}
            />
            <label className="debug-toggle">
              <input type="checkbox" checked={editWalls} onChange={(e) => setEditWalls(e.target.checked)} />
              <span>Click cells to toggle walls</span>
            </label>
            <div className="field-row">
              <button className="btn" onClick={() => setGrid({ ...grid, walls: new Set() })}>Clear walls</button>
              <button className="btn" onClick={() => setGrid(defaultGrid)}>Reset grid</button>
            </div>
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 6.2</span>
            </div>
            <Legend
              items={[
                { label: 'Empty', color: 'var(--paper-2)' },
                { label: 'Frontier', color: 'var(--state-frontier)' },
                { label: 'Visited', color: 'var(--state-visited)' },
                { label: 'Path / endpoint', color: 'var(--accent)' },
                { label: 'Wall', color: 'var(--ink-2)' },
              ]}
            />
          </div>
          <MetricsPanel player={player} category="grid" />
          <DebugPanel
            player={player}
            category="grid"
            algoId={algo}
            input={{ grid: { rows: grid.rows, cols: grid.cols, walls: [...grid.walls], start: grid.start, end: grid.end } }}
            adapterInput={{ rows: grid.rows, cols: grid.cols, walls: [...grid.walls], start: grid.start, end: grid.end }}
          />
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <GridCanvas
                grid={grid}
                steps={player.steps}
                index={player.index}
                onToggleWall={editWalls ? handleToggle : undefined}
              />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 6.1</span>
              <span>
                <em>{ALGOS[algo].label}</em> on {grid.rows}×{grid.cols} grid —{' '}
                <span className="tabular">{ALGOS[algo].complexity}</span>.
              </span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
