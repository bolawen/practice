function x() {
  return new Promise((resolve) => {
    throw new Error("嘻嘻");
    resolve(1);
  });
}

x()
  .then((res) => {
    console.log(res);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  })
  .catch((error) => {
    console.log("4", error);
  });
