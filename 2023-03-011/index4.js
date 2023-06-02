async function async1() {
  console.log("1");
  await async2();
  console.log("2");
}

async function async2() {
  console.log("3");
  return {
    then(cb) {
      cb();
    },
  };
}

console.log("5");

setTimeout(() => {
  console.log("6");
}, 0);

async1();

new Promise((resolve) => {
  console.log("7");
  resolve();
})
  .then(() => {
    console.log("8");
  })
  .then(() => {
    console.log("9");
  })
  .then(() => {
    console.log("10");
  });

console.log("11");

// 结果: 5 1 3  7 11 2 8 9 10 6
