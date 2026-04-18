import { compare, swap, markSorted } from '../../engine/stepTypes.js';

export default function selectionSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push(compare(minIdx, j));
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      steps.push(swap(i, minIdx));
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    steps.push(markSorted(i));
  }
  return steps;
}
