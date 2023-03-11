async function async1() {
  console.log("1");
  await new Promise((resolve,reject)=>{
    resolve();
  })
  console.log("2");
}

async1();

console.log("3");

Promise.resolve()
  .then(() => {
    console.log("4");
  })
  .then(() => {
    console.log("5");
  })
  .then(() => {
    console.log("6");
  });

// 结果: 1 3 4 2 5 6
