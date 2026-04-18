import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import Legend from '../components/Legend.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import GraphCanvas from '../visualizers/GraphCanvas.jsx';
import { graphAlgorithms, getAlgorithm } from '../algorithms/registry.js';
import { sampleGraph, cycleGraph } from '../algorithms/graphs/sampleGraph.js';

const GRAPHS = {
  sample: { label: 'Weighted sample', graph: sampleGraph },
  cycle:  { label: 'Cycle demo',      graph: cycleGraph },
};

export default function GraphPage() {
  const [algo, setAlgo] = useState('bfs');
  const [graphKey, setGraphKey] = useState('sample');
  const graph = GRAPHS[graphKey].graph;
  const [start, setStart] = useState(graph.nodes[0].id);
  const player = usePlayer([]);

  const entry = getAlgorithm('graphs', algo) ?? graphAlgorithms[0];
  const steps = useMemo(() => entry.fn(graph, start), [entry, graph, start]);

  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  useEffect(() => {
    if (!graph.nodes.some((n) => n.id === start)) setStart(graph.nodes[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphKey]);

  useEffect(() => {
    if (algo === 'cycle' && graphKey !== 'cycle') setGraphKey('cycle');
  }, [algo, graphKey]);

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter III</span>
          <span className="chapter-tag">— on frontiers &amp; visits</span>
        </div>
        <h1>Graphs.</h1>
        <p className="dek">
          Four disciplines for exploring a graph — breadth and depth; shortest path with
          <em> Dijkstra</em>; and cycle detection via a DFS recursion stack. Same page,
          different temperaments.
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
              options={graphAlgorithms.map((a) => ({ value: a.id, label: a.label }))}
            />
            <AlgorithmSelect
              label="Graph"
              value={graphKey}
              onChange={setGraphKey}
              options={Object.entries(GRAPHS).map(([v, g]) => ({ value: v, label: g.label }))}
            />
            <AlgorithmSelect
              label="Start node"
              value={start}
              onChange={setStart}
              options={graph.nodes.map((n) => ({ value: n.id, label: n.id }))}
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
                { label: 'Edge traversed', color: 'var(--state-path)' },
                { label: 'Finalized / cycle', color: 'var(--accent)' },
              ]}
            />
          </div>
          <MetricsPanel player={player} category="graphs" />
          <DebugPanel player={player} />
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <GraphCanvas graph={graph} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 3.1</span>
              <span><em>{entry.label}</em> from node <strong>{start}</strong>
                {entry.complexity && <> &nbsp;— <span className="tabular">{entry.complexity.time}</span></>}.
              </span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
