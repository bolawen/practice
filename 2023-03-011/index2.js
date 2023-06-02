async function async1() {
  console.log("1");
  await async2();
  console.log("2");
}

async function async2() {
  console.log("3");
  return new Promise((resolve, reject) => {
    resolve();
    console.log("4");
  });
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


// 结果: 5 1 3 4 7 11 8 9 2 10 6 