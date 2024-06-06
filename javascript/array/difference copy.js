const array1 = [1, 3, 5, 7, 9];
const array2 = [3, 4, 5];

function differenceImpl(set1, set2) {
  const differenceSet = new Set();
  for (let num of set1) {
    if (!set2.has(num)) {
      differenceSet.add(num);
    }
  }
  return [...differenceSet];
}

function difference(array1, array2) {
  const set1 = new Set(array1);
  const set2 = new Set(array2);
  return differenceImpl(set1, set2);
}

const result = difference(array1, array2);
console.log(result); // 输出 [1, 7, 9]
