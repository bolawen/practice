function request() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('ok');
    }, 3000);
  });
}

function requestRetry(reties = 3, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = n => {
      request()
        .then(result => {
          return result;
        })
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.log('已重试', reties - n + 1, '次');
          if (n <= 1) {
            reject(error);
          } else {
            setTimeout(() => attempt(n - 1), delay);
          }
        });
    };

    attempt(reties);
  });
}

requestRetry(3, 500)
  .then(res => {
    console.log('res', res);
  })
  .catch(error => {
    console.log('error', error);
  });
