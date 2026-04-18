import { useEffect, useMemo, useState } from 'react';
import usePlayer from '../engine/usePlayer.js';
import PlayerControls from '../components/PlayerControls.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import InputPanel from '../components/InputPanel.jsx';
import Legend from '../components/Legend.jsx';
import TreeCanvas from '../visualizers/TreeCanvas.jsx';
import {
  buildTreeSilent,
  createEmptyTree,
  insertSteps,
  deleteSteps
} from '../algorithms/trees/bst.js';
import {
  inorderSteps,
  preorderSteps,
  postorderSteps
} from '../algorithms/trees/traversals.js';
import { parseIntList } from '../utils/random.js';

const MODES = {
  insert: { label: 'Insert (walk & place)' },
  delete: { label: 'Delete (find & unlink)' },
  inorder: { label: 'Traversal — inorder' },
  preorder: { label: 'Traversal — preorder' },
  postorder: { label: 'Traversal — postorder' }
};

const DEFAULT_SEED = [50, 30, 70, 20, 40, 60, 80];

export default function TreePage() {
  const [seedStr, setSeedStr] = useState(DEFAULT_SEED.join(', '));
  const [baseTree, setBaseTree] = useState(() => buildTreeSilent(DEFAULT_SEED));
  const [mode, setMode] = useState('inorder');
  const [opValue, setOpValue] = useState('55');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const player = usePlayer([]);

  const { steps, viewInitialTree } = useMemo(() => {
    switch (mode) {
      case 'inorder':
        return { steps: inorderSteps(baseTree), viewInitialTree: baseTree };
      case 'preorder':
        return { steps: preorderSteps(baseTree), viewInitialTree: baseTree };
      case 'postorder':
        return { steps: postorderSteps(baseTree), viewInitialTree: baseTree };
      case 'insert': {
        const v = Number(opValue);
        if (!Number.isFinite(v)) return { steps: [], viewInitialTree: baseTree };
        const { steps } = insertSteps(baseTree, v);
        return { steps, viewInitialTree: baseTree };
      }
      case 'delete': {
        const v = Number(opValue);
        if (!Number.isFinite(v)) return { steps: [], viewInitialTree: baseTree };
        const { steps } = deleteSteps(baseTree, v);
        return { steps, viewInitialTree: baseTree };
      }
      default:
        return { steps: [], viewInitialTree: baseTree };
    }
  }, [mode, baseTree, opValue]);

  useEffect(() => {
    player.controls.loadSteps(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const commitOp = () => {
    const v = Number(opValue);
    if (!Number.isFinite(v)) return;
    setNotice(null);
    if (mode === 'insert') {
      const { tree } = insertSteps(baseTree, v);
      setBaseTree(tree);
    } else if (mode === 'delete') {
      const { tree, found } = deleteSteps(baseTree, v);
      if (!found) setNotice(`Value ${v} not found in tree.`);
      else setBaseTree(tree);
    }
  };

  const handleSeed = (str) => {
    const parsed = parseIntList(str);
    if (parsed.length === 0) return setError('Enter at least one number.');
    setError(null);
    setBaseTree(buildTreeSilent(parsed));
    setSeedStr(parsed.join(', '));
    setNotice(null);
  };

  const handleClear = () => {
    setBaseTree(createEmptyTree());
    setSeedStr('');
  };

  const needsValue = mode === 'insert' || mode === 'delete';
  const modeLabel = MODES[mode].label;

  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Chapter II</span>
          <span className="chapter-tag">— a branching arrangement</span>
        </div>
        <h1>Trees.</h1>
        <p className="dek">
          A binary search tree. Insert and delete are walks: the cursor compares, chooses a side,
          and either places a leaf or unlinks a node. Traversals visit in one of three orderings.
        </p>
      </header>

      <div className="study">
        <aside className="study-aside">
          <div className="block">
            <div className="block-title">
              <h3>Seed</h3>
              <span className="section-num">§ 2.1</span>
            </div>
            <InputPanel
              label="Initial values (inserted in order)"
              placeholder="50, 30, 70, 20, 40"
              value={seedStr}
              onSubmit={handleSeed}
              onChange={setSeedStr}
              error={error}
              submitLabel="Rebuild"
              extra={<button type="button" className="btn ghost" onClick={handleClear}>Clear</button>}
            />
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Operation</h3>
              <span className="section-num">§ 2.2</span>
            </div>
            <AlgorithmSelect
              label="Mode"
              value={mode}
              onChange={(v) => { setMode(v); setNotice(null); }}
              options={Object.entries(MODES).map(([v, m]) => ({ value: v, label: m.label }))}
            />
            {needsValue && (
              <div className="field">
                <label>Target value</label>
                <input
                  type="number"
                  value={opValue}
                  onChange={(e) => setOpValue(e.target.value)}
                />
                <div className="field-row">
                  <button type="button" className="btn primary" onClick={commitOp}>
                    Commit {mode}
                  </button>
                </div>
                <span className="hint">Preview with the player, then commit to mutate the tree.</span>
                {notice && <span className="err">{notice}</span>}
              </div>
            )}
          </div>
          <div className="block">
            <div className="block-title">
              <h3>Legend</h3>
              <span className="section-num">§ 2.3</span>
            </div>
            <Legend
              items={[
                { label: 'Node', color: 'var(--state-default)' },
                { label: 'Comparing', color: 'var(--state-compare)' },
                { label: 'Active', color: 'var(--state-active)' },
                { label: 'Visited', color: 'var(--state-visited)' }
              ]}
            />
          </div>
        </aside>

        <section className="study-main">
          <figure className="figure">
            <div className="figure-frame">
              <TreeCanvas initialTree={viewInitialTree} steps={player.steps} index={player.index} />
            </div>
            <figcaption className="figure-caption">
              <span className="fig-num">Fig. 2.1</span>
              <span><em>{modeLabel}</em> on a binary search tree.</span>
            </figcaption>
          </figure>
          <PlayerControls player={player} />
        </section>
      </div>
    </>
  );
}
