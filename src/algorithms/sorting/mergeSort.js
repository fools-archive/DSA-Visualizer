import { compare, overwrite, markSorted, rangeHighlight } from '../../engine/stepTypes.js';

export default function mergeSort(input) {
  const arr = [...input];
  const steps = [];
  if (arr.length <= 1) {
    arr.forEach((_, i) => steps.push(markSorted(i)));
    return steps;
  }
  sort(arr, 0, arr.length - 1, 0, steps);
  for (let i = 0; i < arr.length; i++) steps.push(markSorted(i));
  return steps;
}

function sort(arr, lo, hi, depth, steps) {
  if (lo >= hi) return;
  steps.push(rangeHighlight(lo, hi, depth));
  const mid = (lo + hi) >> 1;
  sort(arr, lo, mid, depth + 1, steps);
  sort(arr, mid + 1, hi, depth + 1, steps);
  merge(arr, lo, mid, hi, steps);
}

function merge(arr, lo, mid, hi, steps) {
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    steps.push(compare(lo + i, mid + 1 + j));
    if (left[i] <= right[j]) {
      steps.push(overwrite(k, left[i]));
      arr[k++] = left[i++];
    } else {
      steps.push(overwrite(k, right[j]));
      arr[k++] = right[j++];
    }
  }
  while (i < left.length) {
    steps.push(overwrite(k, left[i]));
    arr[k++] = left[i++];
  }
  while (j < right.length) {
    steps.push(overwrite(k, right[j]));
    arr[k++] = right[j++];
  }
}
