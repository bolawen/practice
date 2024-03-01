function request(url, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('url', url);
      resolve('done');
    }, 1000);
  });
}

function foo1() {
  let result = request('http://www.baidu.com', 1, 2, 3);
  return result;
}

function foo2() {
  let result = foo1();
  return result;
}

function main() {
  let result = foo2();
  console.log(result);
}

function runMain(main) {
  const promiseMap = new Map();
  const originRequest = request;

  request = function (url, ...args) {
    const mapKey = url + JSON.stringify(args);
    if (promiseMap.has(mapKey)) {
      const promise = promiseMap.get(mapKey);
      if (promise.state === 'fulfilled') {
        return promise.result;
      } else if (promise.state === 'rejected') {
        throw promise.error;
      }
    } else {
      let curr = originRequest(url, ...args)
        .then(res => {
          promiseMap.set(mapKey, {
            state: 'fulfilled',
            result: res
          });
        })
        .catch(error => {
          promiseMap.set(mapKey, {
            state: 'rejected',
            error: error
          });
        });
      throw curr;
    }
  };

  try {
    main();
  } catch (error) {
    if (error instanceof Promise) {
      error.then(main, main).finally(() => (request = originRequest));
    }
  }
}

runMain(main);
