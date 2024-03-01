function requestWithTimeout(url) {
  const timeoutPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error('Request timeout'));
    }, 4000);
  });

  const requestPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve('Request success');
    }, 5000);
  });

  return Promise.race([timeoutPromise, requestPromise]);
}

requestWithTimeout('xxx')
  .then(res => {
    console.log(res);
  })
  .catch(error => {
    console.log(error);
  });
