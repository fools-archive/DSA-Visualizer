// Central registry for algorithms. Adding a new algorithm:
//   1. Drop the module under src/algorithms/<category>/
//   2. Add an entry below
// Pages read from this; no other edits needed.

import bubbleSort from './sorting/bubbleSort.js';
import selectionSort from './sorting/selectionSort.js';
import insertionSort from './sorting/insertionSort.js';
import mergeSort from './sorting/mergeSort.js';
import quickSort from './sorting/quickSort.js';
import heapSort from './sorting/heapSort.js';

import bfs from './graphs/bfs.js';
import dfs from './graphs/dfs.js';
import dijkstra from './graphs/dijkstra.js';
import cycleDetect from './graphs/cycleDetect.js';

import gridBfs from './grid/gridBfs.js';
import gridDijkstra from './grid/gridDijkstra.js';
import gridAstar from './grid/gridAstar.js';

import { fibTabulation, fibMemo } from './dp/fibonacci.js';
import { knapsack } from './dp/knapsack.js';
import { lcs } from './dp/lcs.js';

export const sortingAlgorithms = [
  { id: 'bubble',    label: 'Bubble Sort',    fn: bubbleSort,    complexity: { time: 'O(n²)', space: 'O(1)' } },
  { id: 'selection', label: 'Selection Sort', fn: selectionSort, complexity: { time: 'O(n²)', space: 'O(1)' } },
  { id: 'insertion', label: 'Insertion Sort', fn: insertionSort, complexity: { time: 'O(n²)', space: 'O(1)' } },
  { id: 'merge',     label: 'Merge Sort',     fn: mergeSort,     complexity: { time: 'O(n log n)', space: 'O(n)' } },
  { id: 'quick',     label: 'Quick Sort',     fn: quickSort,     complexity: { time: 'O(n log n) avg', space: 'O(log n)' } },
  { id: 'heap',      label: 'Heap Sort',      fn: heapSort,      complexity: { time: 'O(n log n)', space: 'O(1)' } },
];

export const graphAlgorithms = [
  { id: 'bfs',      label: 'Breadth-first search', fn: bfs,         complexity: { time: 'O(V + E)', space: 'O(V)' }, weighted: false },
  { id: 'dfs',      label: 'Depth-first search',   fn: dfs,         complexity: { time: 'O(V + E)', space: 'O(V)' }, weighted: false },
  { id: 'dijkstra', label: 'Dijkstra shortest path', fn: dijkstra,  complexity: { time: 'O((V + E) log V)', space: 'O(V)' }, weighted: true },
  { id: 'cycle',    label: 'Cycle detection (DFS)', fn: cycleDetect, complexity: { time: 'O(V + E)', space: 'O(V)' }, weighted: false },
];

export const treeModes = [
  { id: 'insert',    label: 'Insert (walk & place)' },
  { id: 'delete',    label: 'Delete (find & unlink)' },
  { id: 'inorder',   label: 'Traversal — inorder' },
  { id: 'preorder',  label: 'Traversal — preorder' },
  { id: 'postorder', label: 'Traversal — postorder' },
  { id: 'height',    label: 'Height (post-order annotation)' },
  { id: 'balance',   label: 'Balance factor' },
];

export const gridAlgorithms = [
  { id: 'bfs',      label: 'BFS (grid)',      fn: gridBfs,      complexity: { time: 'O(V + E)',     space: 'O(V)' } },
  { id: 'dijkstra', label: 'Dijkstra (grid)', fn: gridDijkstra, complexity: { time: 'O(V log V)',   space: 'O(V)' } },
  { id: 'astar',    label: 'A* (Manhattan)',  fn: gridAstar,    complexity: { time: 'O(V log V)',   space: 'O(V)' } },
];

// DP algorithms return { steps, rows, cols, meta } rather than a raw step
// array — they describe a table, not a linear structure.
export const dpAlgorithms = [
  { id: 'fib-tab',  label: 'Fibonacci (tabulation)',  fn: fibTabulation, complexity: { time: 'O(n)',     space: 'O(n)' } },
  { id: 'fib-memo', label: 'Fibonacci (memoization)', fn: fibMemo,       complexity: { time: 'O(n)',     space: 'O(n)' } },
  { id: 'knapsack', label: '0/1 Knapsack',            fn: knapsack,      complexity: { time: 'O(nW)',    space: 'O(nW)' } },
  { id: 'lcs',      label: 'Longest common subseq.',  fn: lcs,           complexity: { time: 'O(nm)',    space: 'O(nm)' } },
];

export const algorithms = {
  sorting: sortingAlgorithms,
  graphs: graphAlgorithms,
  trees: treeModes,
  grid: gridAlgorithms,
  dp: dpAlgorithms,
};

export function getAlgorithm(category, id) {
  return (algorithms[category] ?? []).find((a) => a.id === id) ?? null;
}
