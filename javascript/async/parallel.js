function request(arg) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('arg', arg);
      if (arg === 3000) {
        console.timeEnd('timer');
      }
      resolve(arg);
    }, arg);
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
        .then(res => {
          result[urlIndex] = res;
        })
        .catch(err => {
          reject(err);
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

const requestArray = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000
];

console.time('timer');
multiRequest(requestArray, 2)
  .then(res => {
    console.log(res);
  })
  .catch(error => {
    console.log(error);
  });
