// Array-backed min-heap. Parent of i is (i-1)/2; children are 2i+1, 2i+2.
// Pure step emitters — we mutate a clone and return { steps, heap }.

import {
  heapCompare,
  heapSwap,
  heapInsert as heapInsertStep,
  heapExtract as heapExtractStep,
} from '../../engine/stepTypes.js';

export const createHeap = () => [];
export const cloneHeap = (h) => [...h];
export const buildHeapSilent = (values) => {
  const heap = [];
  for (const v of values) insertSteps(heap, v); // mutates in place, discards steps
  return heap;
};

export function insertSteps(initial, value) {
  const heap = [...initial];
  const steps = [];
  heap.push(value);
  let i = heap.length - 1;
  steps.push(heapInsertStep(i, value));
  while (i > 0) {
    const parent = (i - 1) >> 1;
    steps.push(heapCompare(i, parent));
    if (heap[i] < heap[parent]) {
      steps.push(heapSwap(i, parent));
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    } else break;
  }
  return { steps, heap };
}

export function extractMinSteps(initial) {
  const heap = [...initial];
  const steps = [];
  if (heap.length === 0) return { steps, heap, value: null };
  const value = heap[0];
  steps.push(heapExtractStep(0, value));
  const last = heap.pop();
  if (heap.length > 0) {
    heap[0] = last;
    // sift down
    let i = 0;
    const n = heap.length;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let smallest = i;
      if (l < n) {
        steps.push(heapCompare(smallest, l));
        if (heap[l] < heap[smallest]) smallest = l;
      }
      if (r < n) {
        steps.push(heapCompare(smallest, r));
        if (heap[r] < heap[smallest]) smallest = r;
      }
      if (smallest === i) break;
      steps.push(heapSwap(i, smallest));
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }
  return { steps, heap, value };
}
