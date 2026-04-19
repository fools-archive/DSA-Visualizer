// Unified step schema.
//
// Legacy step factories in stepTypes.js emit objects shaped like
// `{ type: 'compare', indices: [i, j] }`. Phase 4 introduces a canonical
// shape:
//
//   { kind: 'operation' | 'annotation',
//     domain: 'array' | 'tree' | 'graph' | 'grid' | 'dp' | 'shared',
//     action: string,
//     payload: object }
//
// Rather than rewrite every algorithm, we migrate through this module:
//   - `toUnified(step)` normalizes any legacy step to the canonical shape.
//   - `makeStep(domain, action, payload, extra)` is the new factory that
//     future step families should use; it emits BOTH the new and legacy
//     fields so old canvases keep working.
//
// All downstream consumers (adapters, checkpoints, explain, metrics) read
// through `toUnified` so they're shape-agnostic.

export const DOMAINS = Object.freeze({
  ARRAY: 'array',
  TREE: 'tree',
  GRAPH: 'graph',
  GRID: 'grid',
  DP: 'dp',
  SHARED: 'shared',
});

export const KINDS = Object.freeze({
  OPERATION: 'operation',
  ANNOTATION: 'annotation',
});

// Maps every legacy `type` string to (domain, action, kind). Actions are
// kept identical to the legacy `type` so that code searching by action
// string still finds the same sites.
const TYPE_TABLE = {
  // array / sorting
  'compare':         { domain: 'array', action: 'compare',         kind: 'operation' },
  'swap':            { domain: 'array', action: 'swap',            kind: 'operation' },
  'overwrite':       { domain: 'array', action: 'overwrite',       kind: 'operation' },
  'mark-sorted':     { domain: 'array', action: 'mark-sorted',     kind: 'annotation' },
  'pivot':           { domain: 'array', action: 'pivot',           kind: 'annotation' },
  'range-highlight': { domain: 'array', action: 'range-highlight', kind: 'annotation' },
  // array / heap (heap lives on top of an array)
  'heap-compare':    { domain: 'array', action: 'heap-compare',    kind: 'operation' },
  'heap-swap':       { domain: 'array', action: 'heap-swap',       kind: 'operation' },
  'heap-insert':     { domain: 'array', action: 'heap-insert',     kind: 'operation' },
  'heap-extract':    { domain: 'array', action: 'heap-extract',    kind: 'operation' },
  // tree
  'visit':           { domain: 'tree',  action: 'visit',           kind: 'operation' },
  'compare-node':    { domain: 'tree',  action: 'compare-node',    kind: 'operation' },
  'insert':          { domain: 'tree',  action: 'insert',          kind: 'operation' },
  'delete':          { domain: 'tree',  action: 'delete',          kind: 'operation' },
  'replace-value':   { domain: 'tree',  action: 'replace-value',   kind: 'operation' },
  'rotate-left':     { domain: 'tree',  action: 'rotate-left',     kind: 'operation' },
  'rotate-right':    { domain: 'tree',  action: 'rotate-right',    kind: 'operation' },
  // graph
  'visit-node':      { domain: 'graph', action: 'visit-node',      kind: 'operation' },
  'traverse-edge':   { domain: 'graph', action: 'traverse-edge',   kind: 'operation' },
  'enqueue':         { domain: 'graph', action: 'enqueue',         kind: 'operation' },
  'dequeue':         { domain: 'graph', action: 'dequeue',         kind: 'operation' },
  'push':            { domain: 'graph', action: 'push',            kind: 'operation' },
  'pop':             { domain: 'graph', action: 'pop',             kind: 'operation' },
  'relax':           { domain: 'graph', action: 'relax',           kind: 'operation' },
  'finalize':        { domain: 'graph', action: 'finalize',        kind: 'annotation' },
  'cycle-found':     { domain: 'graph', action: 'cycle-found',     kind: 'annotation' },
  // union-find projects onto the graph domain (a disjoint-set forest)
  'uf-find':         { domain: 'graph', action: 'uf-find',         kind: 'operation' },
  'uf-union':        { domain: 'graph', action: 'uf-union',        kind: 'operation' },
  'uf-compress':     { domain: 'graph', action: 'uf-compress',     kind: 'operation' },
  // grid
  'grid-frontier':   { domain: 'grid',  action: 'grid-frontier',   kind: 'annotation' },
  'grid-visit':      { domain: 'grid',  action: 'grid-visit',      kind: 'operation' },
  'grid-relax':      { domain: 'grid',  action: 'grid-relax',      kind: 'operation' },
  'grid-path':       { domain: 'grid',  action: 'grid-path',       kind: 'annotation' },
  // dp
  'dp-update':       { domain: 'dp',    action: 'dp-update',       kind: 'operation' },
  'dp-highlight':    { domain: 'dp',    action: 'dp-highlight',    kind: 'annotation' },
  'dp-trace':        { domain: 'dp',    action: 'dp-trace',        kind: 'annotation' },
  // shared
  'note':            { domain: 'shared', action: 'note',           kind: 'annotation' },
  'annotate':        { domain: 'shared', action: 'annotate',       kind: 'annotation' },
};

// Convert a legacy step to the unified shape. If the step already carries
// unified fields (domain/action/payload) we trust it and return as-is.
export function toUnified(step) {
  if (!step) return null;
  if (step.domain && step.action && step.payload) return step;
  const meta = TYPE_TABLE[step.type];
  if (!meta) {
    return {
      kind: 'operation',
      domain: 'shared',
      action: step.type ?? 'unknown',
      payload: stripType(step),
    };
  }
  return {
    kind: meta.kind,
    domain: meta.domain,
    action: meta.action,
    payload: stripType(step),
  };
}

export function domainOf(step) {
  if (!step) return null;
  if (step.domain) return step.domain;
  return TYPE_TABLE[step.type]?.domain ?? 'shared';
}

export function kindOf(step) {
  if (!step) return null;
  if (step.kind) return step.kind;
  return TYPE_TABLE[step.type]?.kind ?? 'operation';
}

export function actionOf(step) {
  if (!step) return null;
  return step.action ?? step.type ?? null;
}

// Preferred factory going forward. Emits BOTH the unified fields and a
// flat legacy projection (`type` + payload spread) so pre-Phase-4 canvases
// and metrics keep working without a single edit.
export function makeStep(domain, action, payload = {}, { kind } = {}) {
  const resolvedKind = kind ?? TYPE_TABLE[action]?.kind ?? 'operation';
  return {
    kind: resolvedKind,
    domain,
    action,
    payload,
    type: action,
    ...payload,
  };
}

function stripType(step) {
  const { type, kind, domain, action, payload, ...rest } = step;
  return rest;
}
