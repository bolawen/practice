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

const array = [3, 1, 2, 8, 7, 9, 4];
sort(array);
console.log(array);

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
