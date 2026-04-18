import { compare, overwrite, markSorted } from '../../engine/stepTypes.js';

export default function insertionSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  if (n > 0) steps.push(markSorted(0));
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0) {
      steps.push(compare(j, j + 1));
      if (arr[j] > key) {
        steps.push(overwrite(j + 1, arr[j]));
        arr[j + 1] = arr[j];
        j--;
      } else break;
    }
    steps.push(overwrite(j + 1, key));
    arr[j + 1] = key;
    steps.push(markSorted(i));
  }
  return steps;
}
