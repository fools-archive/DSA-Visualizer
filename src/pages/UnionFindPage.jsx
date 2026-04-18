import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import Legend from '../components/Legend.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import DebugPanel from '../components/DebugPanel.jsx';
import UnionFindCanvas from '../visualizers/UnionFindCanvas.jsx';
import {
  createUnionFind,
  unionSteps,
  findSteps,
} from '../algorithms/unionFind/unionFind.js';

const MODES = {
  union: 'Union',
  find: 'Find',
};

const DEFAULT_ELEMENTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function UnionFindPage() {
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);
  const [state, setState] = useState(() => createUnionFind(DEFAULT_ELEMENTS));
  const [mode, setMode] = useState('union');
  const [a, setA] = useState('A');
  const [b, setB] = useState('B');
  const [elementsStr, setElementsStr] = useState(DEFAULT_ELEMENTS.join(', '));

  const player = usePlayer([]);

  const { steps } = useMemo(() => {
    if (mode === 'find') return findSteps(state, a);
    return unionSteps(state, a, b);
  }, [mode, state, a, b]);

  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const commit = () => {
    if (mode === 'find') {
      const { state: next } = findSteps(state, a);
      setState(next);
    } else {
      const { state: next } = unionSteps(state, a, b);
      setState(next);
    }
  };

  const handleElements = (str) => {
    const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    setElements(parts);
    setState(createUnionFind(parts));
    setElementsStr(parts.join(', '));
    if (!parts.includes(a)) setA(parts[0]);
    if (!parts.includes(b)) setB(parts[1] ?? parts[0]);
  };

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter V</span>
          <span className="chapter-tag">— the disjoint-set forest</span>
        </div>
        <h1>Union-Find.</h1>
        <p className="dek">
          Elements begin as singletons. <em>Union</em> merges two sets using rank as a
          tie-breaker; <em>find</em> walks to the root and compresses the path on its way back.
          The tree flattens as you go.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Elements</h3>
              <span className="section-num">§ 5.1</span>
            </div>
            <InputPanel
              label="Element labels"
              placeholder="A, B, C"
              value={elementsStr}
              onChange={setElementsStr}
              onSubmit={handleElements}
              submitLabel="Reset"
              hint="Reset clears all unions."
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Operation</h3>
              <span className="section-num">§ 5.2</span>
            </div>
            <AlgorithmSelect
              label="Mode"
              value={mode}
              onChange={setMode}
              options={Object.entries(MODES).map(([v, l]) => ({ value: v, label: l }))}
            />
            <AlgorithmSelect
              label={mode === 'find' ? 'Element' : 'First'}
              value={a}
              onChange={setA}
              options={elements.map((e) => ({ value: e, label: e }))}
            />
            {mode === 'union' && (
              <AlgorithmSelect
                label="Second"
                value={b}
                onChange={setB}
                options={elements.map((e) => ({ value: e, label: e }))}
              />
            )}
            <div className="field-row">
              <button className="btn primary" onClick={commit}>Commit {mode}</button>
            </div>
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 5.3</span>
            </div>
            <Legend
              items={[
                { label: 'Element', color: 'var(--state-default)' },
                { label: 'Find target', color: 'var(--state-compare)' },
                { label: 'Compressed', color: 'var(--state-active)' },
                { label: 'Union roots', color: 'var(--accent)' },
              ]}
            />
          </div>
          <MetricsPanel player={player} category="unionFind" />
          <DebugPanel player={player} />
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <UnionFindCanvas initial={state} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 5.1</span>
              <span><em>{MODES[mode]}</em> over {elements.length} element{elements.length === 1 ? '' : 's'}.</span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
