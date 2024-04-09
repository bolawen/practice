function requestRetry(retries = 3, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      request()
        .then((result) => {
          return result;
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log("已重试", retries - n + 1, "次");

          if (n <= 1) {
            reject(error);
          } else {
            setTimeout(() => attempt(n - 1), delay);
          }
        });
    };

    attempt(retries);
  });
}

function requestRetry(retries = 3, delay = 500) {
  return new Promise(() => {
    const attempt = (n) => {
      request()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log("已重试", retries - n + 1, "次");

          if (n <= 1) {
            reject(error);
          } else {
            setTimeout(() => attempt(n - 1), delay);
          }
        });
    };

    attempt(retries);
  });
}
