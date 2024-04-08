function selectSort(array) {
  let minIndex;

  for (let i = 0; i < array.length - 1; i++) {
    minIndex = i;
    for (let j = minIndex + 1; j < array.length; j++) {
      if (array[minIndex] > array[j]) {
        minIndex = j;
      }
    }
    [array[i], array[minIndex]] = [array[minIndex], array[i]];
  }

  return array;
}
