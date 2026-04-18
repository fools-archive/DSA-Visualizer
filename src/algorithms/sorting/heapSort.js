import { compare, swap, markSorted } from '../../engine/stepTypes.js';

export default function heapSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(arr, i, n, steps);
  for (let end = n - 1; end > 0; end--) {
    steps.push(swap(0, end));
    [arr[0], arr[end]] = [arr[end], arr[0]];
    steps.push(markSorted(end));
    siftDown(arr, 0, end, steps);
  }
  if (n > 0) steps.push(markSorted(0));
  return steps;
}

// Max-heap sift-down, in-place.
function siftDown(arr, root, size, steps) {
  let i = root;
  while (true) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    let largest = i;
    if (l < size) {
      steps.push(compare(largest, l));
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < size) {
      steps.push(compare(largest, r));
      if (arr[r] > arr[largest]) largest = r;
    }
    if (largest === i) break;
    steps.push(swap(i, largest));
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}
