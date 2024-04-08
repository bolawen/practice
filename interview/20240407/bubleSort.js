function bubbleSort(array) {
  let swapped = true;
  let swappedIndex = -1;
  let indexOfIndex = array.length - 1;

  while (swapped) {
    swapped = false;

    for (let i = 0; i < indexOfIndex; i++) {
      if (array[i] > array[i + 1]) {
        swapped = true;
        swappedIndex = i;
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
      }
    }

    indexOfIndex = swappedIndex;
  }
}

const array = [8, 5, 3, 1, 9, 10, 3];
bubbleSort(array);
console.log(array);
