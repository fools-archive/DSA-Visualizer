import { compare, swap, markSorted, pivot, rangeHighlight } from '../../engine/stepTypes.js';

export default function quickSort(input) {
  const arr = [...input];
  const steps = [];
  sort(arr, 0, arr.length - 1, 0, steps);
  for (let i = 0; i < arr.length; i++) steps.push(markSorted(i));
  return steps;
}

function sort(arr, lo, hi, depth, steps) {
  if (lo >= hi) {
    if (lo === hi) steps.push(markSorted(lo));
    return;
  }
  steps.push(rangeHighlight(lo, hi, depth));
  const p = partition(arr, lo, hi, steps);
  steps.push(markSorted(p));
  sort(arr, lo, p - 1, depth + 1, steps);
  sort(arr, p + 1, hi, depth + 1, steps);
}

// Lomuto partition with rightmost pivot.
function partition(arr, lo, hi, steps) {
  const pivotValue = arr[hi];
  steps.push(pivot(hi));
  let i = lo;
  for (let j = lo; j < hi; j++) {
    steps.push(compare(j, hi));
    if (arr[j] < pivotValue) {
      if (i !== j) {
        steps.push(swap(i, j));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      i++;
    }
  }
  if (i !== hi) {
    steps.push(swap(i, hi));
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
  }
  return i;
}
