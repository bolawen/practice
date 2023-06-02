function Scheduler(urls, maxNum, iteratorFn) {
  let index = 0;
  const task = [];
  const taskTemp = [];
  const run = () => {
    if (index === urls.length) {
      return Promise.resolve();
    }
    const url = urls[index++];
    const taskItem = Promise.resolve().then(() => iteratorFn(url));
    task.push(taskItem);
    let promise = Promise.resolve();
    if (maxNum <= urls.length) {
      const promiseTemp = taskItem.then(() =>
        taskTemp.splice(taskTemp.indexOf(promiseTemp), 1)
      );
      taskTemp.push(promiseTemp);
      if (taskTemp.length >= maxNum) {
        promise = Promise.race(taskTemp);
      }
    }
    return promise.then(() => run());
  };
  return run().then(() => Promise.all(task));
}

function requestFn1() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn1");
      console.log("requestFn1");
    }, 3000);
  });
}

function requestFn2() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn2");
      console.log("requestFn2");
    }, 5000);
  });
}

function requestFn3() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn3");
      console.log("requestFn3");
    }, 1000);
  });
}

function requestFn4() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn4");
      console.log("requestFn4");
    }, 1000);
  });
}

function requestFn5() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn5");
      console.log("requestFn5");
    }, 3000);
  });
}

function requestFn6() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn6");
      console.log("requestFn6");
    }, 5000);
  });
}

function requestFn7() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn7");
      console.log("requestFn7");
    }, 2000);
  });
}

function requestFn8() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn8");
      console.log("requestFn8");
    }, 4000);
  });
}

function requestFn9() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn9");
      console.log("requestFn9");
    }, 6000);
  });
}

function requestFn10() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("requestFn10");
      console.log("requestFn10");
    }, 2000);
  });
}


async function multiRequest(maxNum) {
    const requestFnList = [
      requestFn1,
      requestFn2,
      requestFn3,
      requestFn4,
      requestFn5,
      requestFn6,
      requestFn7,
      requestFn8,
      requestFn9,
      requestFn10,
    ];
  const result = await Scheduler(requestFnList, maxNum, request);
  console.log(result);
}