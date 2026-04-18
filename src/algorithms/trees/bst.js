import {
  insertNode,
  deleteNode,
  compareNode,
  replaceNodeValue
} from '../../engine/stepTypes.js';

/**
 * Tree model: nodes = { [id]: { id, value, left, right, parent } }
 * IDs are stable strings assigned on insertion.
 */
let _idCounter = 0;
const nextId = () => `n${++_idCounter}`;

export function createEmptyTree() {
  return { rootId: null, nodes: {} };
}

export function cloneTree(tree) {
  const copy = { rootId: tree.rootId, nodes: {} };
  for (const k of Object.keys(tree.nodes)) copy.nodes[k] = { ...tree.nodes[k] };
  return copy;
}

function newNode(value, parentId) {
  return { id: nextId(), value, left: null, right: null, parent: parentId };
}

// Silent build — no steps. Used to prime the tree state.
export function buildTreeSilent(values) {
  const tree = createEmptyTree();
  for (const v of values) insertSilent(tree, v);
  return tree;
}

function insertSilent(tree, value) {
  if (!tree.rootId) {
    const node = newNode(value, null);
    tree.nodes[node.id] = node;
    tree.rootId = node.id;
    return;
  }
  let curId = tree.rootId;
  while (true) {
    const cur = tree.nodes[curId];
    if (value === cur.value) return; // no duplicates
    if (value < cur.value) {
      if (cur.left) { curId = cur.left; continue; }
      const node = newNode(value, cur.id);
      tree.nodes[node.id] = node;
      cur.left = node.id;
      return;
    } else {
      if (cur.right) { curId = cur.right; continue; }
      const node = newNode(value, cur.id);
      tree.nodes[node.id] = node;
      cur.right = node.id;
      return;
    }
  }
}

// Step-emitting operations — operate on an *initial* tree, return steps AND
// the resulting tree state so the page can keep subsequent ops consistent.

export function insertSteps(initialTree, value) {
  const tree = cloneTree(initialTree);
  const steps = [];
  if (!tree.rootId) {
    const node = newNode(value, null);
    tree.nodes[node.id] = node;
    tree.rootId = node.id;
    steps.push(insertNode(node.id, null, value, 'root'));
    return { steps, tree };
  }
  let curId = tree.rootId;
  while (true) {
    const cur = tree.nodes[curId];
    steps.push(compareNode(cur.id, value));
    if (value === cur.value) return { steps, tree };
    if (value < cur.value) {
      if (cur.left) { curId = cur.left; continue; }
      const node = newNode(value, cur.id);
      tree.nodes[node.id] = node;
      cur.left = node.id;
      steps.push(insertNode(node.id, cur.id, value, 'left'));
      return { steps, tree };
    } else {
      if (cur.right) { curId = cur.right; continue; }
      const node = newNode(value, cur.id);
      tree.nodes[node.id] = node;
      cur.right = node.id;
      steps.push(insertNode(node.id, cur.id, value, 'right'));
      return { steps, tree };
    }
  }
}

export function deleteSteps(initialTree, value) {
  const tree = cloneTree(initialTree);
  const steps = [];
  let curId = tree.rootId;
  while (curId) {
    const cur = tree.nodes[curId];
    steps.push(compareNode(cur.id, value));
    if (value === cur.value) break;
    curId = value < cur.value ? cur.left : cur.right;
  }
  if (!curId) return { steps, tree, found: false };

  const target = tree.nodes[curId];

  // Case 1: leaf or single child
  if (!target.left || !target.right) {
    const childId = target.left || target.right;
    if (!target.parent) {
      tree.rootId = childId;
    } else {
      const parent = tree.nodes[target.parent];
      if (parent.left === target.id) parent.left = childId;
      else parent.right = childId;
    }
    if (childId) tree.nodes[childId].parent = target.parent;
    delete tree.nodes[target.id];
    steps.push(deleteNode(target.id));
    return { steps, tree, found: true };
  }

  // Case 2: two children — inorder successor (min of right subtree)
  let succId = target.right;
  while (tree.nodes[succId].left) {
    steps.push(compareNode(succId, value));
    succId = tree.nodes[succId].left;
  }
  const succ = tree.nodes[succId];
  const succValue = succ.value;
  steps.push(replaceNodeValue(target.id, succValue));
  target.value = succValue;

  // Remove successor (has at most a right child)
  const succChild = succ.right;
  const succParent = tree.nodes[succ.parent];
  if (succParent.left === succ.id) succParent.left = succChild;
  else succParent.right = succChild;
  if (succChild) tree.nodes[succChild].parent = succ.parent;
  delete tree.nodes[succ.id];
  steps.push(deleteNode(succ.id));

  return { steps, tree, found: true };
}
