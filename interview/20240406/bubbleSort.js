function bubbleSort(array) {
  let swapped = true;
  for (let i = 0; i < array.length - 1; i++) {
    if (!swapped) {
      break;
    }
    swapped = false;
    for (let j = 0; j < array.length - 1 - i; j++) {
      if (array[j] > array[j + 1]) {
        swapped = true;
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
}

function bubblerSort(array) {
  let swapped = true;

  for (let i = 0; i < array.length - 1; i++) {
    if (!swapped) {
      break;
    }
    swapped = false;
    for (let j = 0; j < array.length - 1 - i; j++) {
      if (array[j] > array[j + 1]) {
        swapped = true;
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
}

function bubbleSort(array) {
  let swapped = true;
  let indexOfLast = array.length - 1;
  let swappedIndex = -1;

  while (swapped) {
    swapped = false;
    for (let i = 0; i < indexOfLast; i++) {
      if (array[i] > array[i + 1]) {
        swapped = true;
        swappedIndex = i;
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
      }
    }
    indexOfLast = swappedIndex;
  }
}

function bubbleSort(array) {
  let swapped = true;
  let swappedIndex = -1;
  let indexOfLast = array.length - 1;

  while (swapped) {
    swapped = false;
    for (let i = 0; i < indexOfLast; i++) {
      if (array[i] > array[i + 1]) {
        swapped = true;
        swappedIndex = i;
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
      }
    }
    indexOfLast = swappedIndex;
  }
}
