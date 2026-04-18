import { compare, swap, markSorted } from '../../engine/stepTypes.js';

export default function bubbleSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(compare(j, j + 1));
      if (arr[j] > arr[j + 1]) {
        steps.push(swap(j, j + 1));
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    steps.push(markSorted(n - i - 1));
    if (!swapped) {
      for (let k = n - i - 2; k >= 0; k--) steps.push(markSorted(k));
      break;
    }
  }
  if (n > 0) steps.push(markSorted(0));
  return steps;
}
