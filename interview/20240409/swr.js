function wrapperSWR() {
  const cache = new Map();

  return async function (cacheKey, request, timeout) {
    const data = cache.get(cacheKey) || { value: null, promise: null };
    cache.set(cacheKey, data);

    if (!data.value && !data.promise) {
      data.promise = request(timeout)
        .then((res) => {
          data.value = res;
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          data.promise = null;
        });
    }

    if (data.promise && !data.value) {
      await data.promise;
    }

    return data.value;
  };
}

const swr = wrapperSWR();

function request(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("timeout", timeout);
      resolve(timeout);
    }, timeout);
  });
}

async function getData1() {
  const result = await swr("getData1", request, 2000);
  console.log("result", result);
}

getData1(1000);
getData1(2000);
getData1(4000);
