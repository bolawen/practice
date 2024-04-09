function quickSort(array, start, end) {
  if (start >= end) {
    return;
  }
  let left = start;
  let right = end;
  let pivot = array[left];

  while (left < right) {
    while (left < right && array[right] > pivot) {
      right--;
    }
    while (left < right && array[left] <= pivot) {
      left++;
    }
    [array[left], array[right]] = [array[right], array[left]];
  }

  [array[start], array[left]] = [array[left], array[start]];
  quickSort(array, start, left - 1);
  quickSort(array, right + 1, end);
}

function sort(array) {
  quickSort(array, 0, array.length - 1);
}

function twoSum(array, target) {
  const map = new Map();
  const result = [];
  sort(array);

  let i = 0;
  while (i < array.length) {
    let value = array[i];
    let k = target - value;

    if (map.has(k)) {
      result.push([k, value]);
      while (value === array[i + 1]) {
        i++;
      }
      i++;
    } else {
      map.set(value, i);
      i++;
    }
  }

  return result;
}

const array = [1, 2, 7, 8, 11, 15];
const result = twoSum(array, 9);
console.log(result);
