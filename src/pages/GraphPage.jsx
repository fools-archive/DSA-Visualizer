import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import Legend from '../components/Legend.jsx';
import GraphCanvas from '../visualizers/GraphCanvas.jsx';
import bfs from '../algorithms/graphs/bfs.js';
import dfs from '../algorithms/graphs/dfs.js';
import { sampleGraph } from '../algorithms/graphs/sampleGraph.js';

const ALGOS = {
  bfs: { label: 'Breadth-first search' },
  dfs: { label: 'Depth-first search' }
};

const FNS = { bfs, dfs };

export default function GraphPage() {
  const [algo, setAlgo] = useState('bfs');
  const [start, setStart] = useState('A');
  const player = usePlayer([]);

  const steps = useMemo(() => FNS[algo](sampleGraph, start), [algo, start]);

  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter III</span>
          <span className="chapter-tag">— on frontiers &amp; visits</span>
        </div>
        <h1>Graphs.</h1>
        <p className="dek">
          Two disciplines for exploring a graph: breadth-first, which fans out evenly; and
          depth-first, which commits to a path and backtracks. Same graph, two temperaments.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Parameters</h3>
              <span className="section-num">§ 3.1</span>
            </div>
            <AlgorithmSelect
              label="Method"
              value={algo}
              onChange={setAlgo}
              options={Object.entries(ALGOS).map(([v, a]) => ({ value: v, label: a.label }))}
            />
            <AlgorithmSelect
              label="Start node"
              value={start}
              onChange={setStart}
              options={sampleGraph.nodes.map((n) => ({ value: n.id, label: n.id }))}
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 3.2</span>
            </div>
            <Legend
              items={[
                { label: 'Unseen', color: 'var(--state-default)' },
                { label: 'In frontier', color: 'var(--state-frontier)' },
                { label: 'Active', color: 'var(--state-active)' },
                { label: 'Visited', color: 'var(--state-visited)' },
                { label: 'Edge traversed', color: 'var(--state-path)' }
              ]}
            />
          </div>
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <GraphCanvas graph={sampleGraph} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 3.1</span>
              <span><em>{ALGOS[algo].label}</em> from node <strong>{start}</strong>.</span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
