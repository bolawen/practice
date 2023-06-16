function x() {
  return new Promise((resolve) => {
    throw new Error("嘻嘻");
    resolve(1);
  });
}

x()
  .then(
    (res) => {
      console.log(res);
    },
    (error) => {
      console.log("res", error);
    }
  )
  .then(
    () => {
      console.log(2);
    },
    (error) => {
      console.log("2", error);
    }
  )
  .then(
    () => {
      console.log(3);
    },
    (error) => {
      console.log("3", error);
    }
  )
  .then(() => {
    console.log(4);
  })
  .catch((error) => {
    console.log("4", error);
  });
