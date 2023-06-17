function spawn(genFun) {
  return new Promise((resolve, reject) => {
    const gen = genFun();
    function step(nextFun) {
      let next;
      try {
        next = nextFun();
      } catch (e) {
        return reject(e);
      }
      if (next.done) {
        return resolve(next.value);
      }
      Promise.resolve(next.value).then(
        (value) => {
          step(function () {
            return gen.next(value);
          });
        },
        (error) => {
          step(function () {
            return gen.throw(error);
          });
        }
      );
    }
    step(function () {
      return gen.next(undefined);
    });
  });
}

function promise1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2000);
    }, 2000);
  });
}
function promise2() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(3000);
    }, 3000);
  });
}

function awaitSelf(args) {
  return spawn(function* () {
    const result1 = yield promise1();
    console.log(result1);
    const result2 = yield promise2();
    console.log(result2);
  });
}

awaitSelf();
