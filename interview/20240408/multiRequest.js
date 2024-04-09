function request(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("timeout", timeout);
      if (timeout === 3000) {
        console.timeEnd("timer");
      }
      resolve(timeout);
    }, timeout);
  });
}

function multiRequest(urls, maxNum) {
  let index = 0;
  let running = 0;
  let result = new Array(urls.length).fill(false);

  return new Promise((resolve, reject) => {
    const launchRequest = () => {
      if (index >= urls.length) {
        if (running === 0) {
          resolve(result);
        }
        return;
      }

      const urlIndex = index++;
      running++;

      request(urls[urlIndex])
        .then((res) => {
          result[urlIndex] = res;
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          running--;
          launchRequest();
        });
    };

    while (index < maxNum && index < urls.length) {
      launchRequest();
    }
  });
}

const urls = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

console.time("timer");

multiRequest(urls, 3)
  .then((res) => {
    console.log("res", res);
  })
  .catch((error) => {
    console.log("error", error);
  });
