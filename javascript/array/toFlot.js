function union(array1, array2) {
  let curr;
  let i = array1.length - 1;
  let j = array2.length - 1;
  let tail = array1.length + array2.length - 1;

  while (i >= 0 && j >= 0) {
    if (i === -1) {
      curr = array2[j--];
    } else if (j === -1) {
      curr = array1[i--];
    } else if (array1[i] > array2[j]) {
      curr = array1[i--];
    } else {
      curr = array2[j--];
    }
    array1[tail--] = curr;
  }
}

const array1 = [1, 3, 5, 7, 9];
const array2 = [2, 3, 4, 5, 6, 8, 10];
union(array1, array2);
console.log("array1", array1);
