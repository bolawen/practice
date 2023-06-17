// function* fibonacci() {
//   let [prev, curr] = [0, 1];
//   for (;;) {
//     yield curr;
//     [prev, curr] = [curr, prev + curr];
//   }
// }

// function getFib(n) {
//   const reuslt = [];
//   for (let value of fibonacci()) {
//     if (reuslt.length >= n) {
//       return reuslt;
//     }
//     reuslt.push(value);
//   }
// }

// const fib = getFib(10);
// console.log(fib);

// function getFib(n) {
//   let a = 0;
//   let b = 1;
//   let result = [];
//   while (n--) {
//     [a, b] = [b, a + b];
//     result.push(a);
//   }
//   return result;
// }

// function getFibByN(n) {
//   let a = 0;
//   let b = 1;
//   while (n--) {
//     [a, b] = [b, a + b];
//   }
//   return a;
// }

// const fibN = getFibByN(1);
// console.log(fibN);

// function* fibonacci() {
//   let [prev, curr] = [0, 1];
//   for (;;) {
//     yield curr;
//     [prev, curr] = [curr, prev + curr];
//   }
// }

// function getFibByN(n) {
//   let index = 1;
//   for (let value of fibonacci()) {
//     if (index >= n) {
//       return value;
//     }
//     index++;
//   }
// }

// const fibN = getFibByN(10);
// console.log(fibN);

// function getFibByN(n) {
//   let x = 0;
//   let y = 0;
//   let z = 1;
//   for (let i = 0; i < n; i++) {
//     x = y;
//     y = z;
//     z = x + y;
//   }
//   return y;
// }

// const fibN = getFibByN(10);
// console.log(fibN);

// function spawnFibonacci(n) {
//   let index = 1;
//   for (let value of fibonacci()) {
//     if (index >= n) {
//       console.log(value);
//       break;
//     }
//     index++;
//     value;
//   }
// }

// console.log(spawnFibonacci(10));

// function fib(n) {
//   if (n < 2) {
//     return n;
//   }
//   let x = 0;
//   let y = 0;
//   let z = 1;
//   for (let i = 2; i <= n; i++) {
//     x = y;
//     y = z;
//     z = x + y;
//   }
//   return z;
// }

// console.log(fib(10));

function getFibByN(n) {
  const result = [1, 1];

  const fibonacci = (n) => {
    if (n < 2) {
      return result[n];
    }
    if (result[n] != undefined) {
      return result[n];
    }
    let value = fibonacci(n - 1) + fibonacci(n - 2);
    result[n] = value;
    return value;
  };

  return fibonacci(n - 1);
}

const fibN = getFibByN(1);
console.log(fibN);
