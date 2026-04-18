// Metrics are derived by counting events in the executed prefix of a step
// stream. Algorithms stay pure — we never mutate a counter inside them.

const ZERO = () => ({
  comparisons: 0,
  swaps: 0,
  overwrites: 0,
  visits: 0,
  edgesTraversed: 0,
  enqueues: 0,
  insertions: 0,
  deletions: 0,
  rotations: 0,
  relaxations: 0,
  unions: 0,
  finds: 0,
  cellsVisited: 0,
  cellsUpdated: 0,
  pathLength: 0,
  stepsExecuted: 0,
});

export function computeMetrics(steps, uptoIndex) {
  const m = ZERO();
  const end = Math.max(0, Math.min(uptoIndex, steps.length));
  for (let i = 0; i < end; i++) {
    const s = steps[i];
    m.stepsExecuted++;
    switch (s.type) {
      case 'compare':
      case 'compare-node':
      case 'heap-compare':
        m.comparisons++; break;
      case 'swap':
      case 'heap-swap':
        m.swaps++; break;
      case 'overwrite':
        m.overwrites++; break;
      case 'visit':
      case 'visit-node':
        m.visits++; break;
      case 'traverse-edge':
        m.edgesTraversed++; break;
      case 'enqueue':
      case 'push':
        m.enqueues++; break;
      case 'insert':
      case 'heap-insert':
        m.insertions++; break;
      case 'delete':
      case 'heap-extract':
        m.deletions++; break;
      case 'rotate-left':
      case 'rotate-right':
        m.rotations++; break;
      case 'relax':
        m.relaxations++; break;
      case 'uf-union':
        m.unions++; break;
      case 'uf-find':
        m.finds++; break;
      case 'grid-visit':
        m.cellsVisited++; break;
      case 'grid-relax':
        m.relaxations++; break;
      case 'grid-path':
        m.pathLength++; break;
      case 'dp-update':
        m.cellsUpdated++; break;
      default: break;
    }
  }
  return m;
}

// Fields most worth displaying per category, in order.
export const metricFieldsByCategory = {
  sorting: ['comparisons', 'swaps', 'overwrites', 'stepsExecuted'],
  trees:   ['comparisons', 'visits', 'insertions', 'deletions', 'rotations', 'stepsExecuted'],
  graphs:  ['visits', 'edgesTraversed', 'enqueues', 'relaxations', 'stepsExecuted'],
  heap:    ['comparisons', 'swaps', 'insertions', 'deletions', 'stepsExecuted'],
  unionFind: ['finds', 'unions', 'stepsExecuted'],
  grid:    ['cellsVisited', 'relaxations', 'pathLength', 'stepsExecuted'],
  dp:      ['cellsUpdated', 'stepsExecuted'],
};

export const metricLabels = {
  comparisons: 'Comparisons',
  swaps: 'Swaps',
  overwrites: 'Overwrites',
  visits: 'Visits',
  edgesTraversed: 'Edges',
  enqueues: 'Enqueues',
  insertions: 'Insertions',
  deletions: 'Deletions',
  rotations: 'Rotations',
  relaxations: 'Relaxations',
  unions: 'Unions',
  finds: 'Finds',
  cellsVisited: 'Cells visited',
  cellsUpdated: 'Cells updated',
  pathLength: 'Path length',
  stepsExecuted: 'Steps',
};
