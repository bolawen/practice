function Scheduler(requestFnList) {
  if (!Array.isArray(requestFnList)) {
    throw new TypeError("requestFnList 必须为函数数组");
  }
  for (const fn of requestFnList) {
    if (typeof fn !== "function") {
      throw new TypeError("requestFnList 元素必须为函数");
    }
  }

  return function (context, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error("next() 函数不可以调用多次"));
      }
      index = i;
      let fn = requestFnList[i];
      if (i === requestFnList.length) {
        fn === next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return dispatch(0);
  };
}

function requestFn1(context, next) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve("requestFn1");
      console.log("requestFn1");
      next();
    }, 3000);
  });
}

function requestFn2(context, next) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve("requestFn2");
      console.log("requestFn2");
      next();
    }, 5000);
  });
}

function requestFn3(context, next) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve("requestFn3");
      console.log("requestFn3");
      next();
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

const requestFnList = [requestFn1, requestFn2, requestFn3, requestFn4];
Scheduler(requestFnList)({});
