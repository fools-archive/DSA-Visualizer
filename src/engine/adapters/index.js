// Domain adapters centralize the reducer logic that canvases previously
// inlined. Each adapter conforms to:
//
//   const adapter = createXxxAdapter(config?);
//   adapter.initialize(input) -> void       // seed from input
//   adapter.reset()           -> void       // back to freshly-initialized
//   adapter.applyStep(step)   -> void       // mutate internal state
//   adapter.getState()        -> object     // a plain snapshot (cloned)
//   adapter.clone()           -> Adapter    // independent copy
//
// Adapters are the bridge the checkpoint system and the comparison engine
// rely on — they give us a domain-agnostic "state at step i" primitive.

export { createArrayAdapter } from './arrayAdapter.js';
export { createTreeAdapter } from './treeAdapter.js';
export { createGraphAdapter } from './graphAdapter.js';
export { createGridAdapter } from './gridAdapter.js';
export { createDPAdapter } from './dpAdapter.js';

import { createArrayAdapter } from './arrayAdapter.js';
import { createTreeAdapter } from './treeAdapter.js';
import { createGraphAdapter } from './graphAdapter.js';
import { createGridAdapter } from './gridAdapter.js';
import { createDPAdapter } from './dpAdapter.js';

const REGISTRY = {
  array: createArrayAdapter,
  tree: createTreeAdapter,
  graph: createGraphAdapter,
  grid: createGridAdapter,
  dp: createDPAdapter,
};

export function getAdapter(domain, config) {
  const factory = REGISTRY[domain];
  if (!factory) throw new Error(`No adapter registered for domain "${domain}"`);
  return factory(config);
}

export const ADAPTER_DOMAINS = Object.keys(REGISTRY);
