function Iterator(list) {
  let index = 0;
  return {
    next: function () {
      return index < list.length
        ? { value: list[index++], done: false }
        : { value: undefined, done: true };
    },
  };
}

// const iterator = Iterator([1, 2]);
// // const result1 = iterator.next();
// // console.log(result1);
// // const result2 = iterator.next();
// // console.log(result2);
// // const result3 = iterator.next();
// // console.log(result3);

// for (let value of iterator) {
//   console.log(value);
// }

function Iterator() {
  const self = this;
  let index = 0;
  return {
    next: function () {
      return index < self.length
        ? { value: self[index++] + 0, done: false }
        : { value: undefined, done: true };
    },
  };
}

const list = [1, 2];
list[Symbol.iterator] = Iterator;

for (let value of list) {
  console.log(value);
}
