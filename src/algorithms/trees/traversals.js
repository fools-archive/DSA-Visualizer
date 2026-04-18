import { visitNode } from '../../engine/stepTypes.js';

export function inorderSteps(tree) {
  const steps = [];
  const walk = (id) => {
    if (!id) return;
    const n = tree.nodes[id];
    walk(n.left);
    steps.push(visitNode(id));
    walk(n.right);
  };
  walk(tree.rootId);
  return steps;
}

export function preorderSteps(tree) {
  const steps = [];
  const walk = (id) => {
    if (!id) return;
    const n = tree.nodes[id];
    steps.push(visitNode(id));
    walk(n.left);
    walk(n.right);
  };
  walk(tree.rootId);
  return steps;
}

export function postorderSteps(tree) {
  const steps = [];
  const walk = (id) => {
    if (!id) return;
    const n = tree.nodes[id];
    walk(n.left);
    walk(n.right);
    steps.push(visitNode(id));
  };
  walk(tree.rootId);
  return steps;
}
