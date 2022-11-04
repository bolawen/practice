const cache = {};

function request(url, success, fail) {
  setTimeout(() => {
    fail(url);
  }, 3000);
}

function cacheRequest(url, successCallback, failCallback) {
  if (cache[url]) {
    if (cache[url].status === "success") {
      successCallback(cache[url].data);
    } else if (cache[url].status === "fail") {
      failCallback(cache[url].data);
    } else {
      if (cache[url].queue && cache[url].queue.length > 0) {
        cache[url].queue.push({ success: successCallback, fail: failCallback });
      } else {
        cache[url].queue = [{ success: successCallback, fail: failCallback }];
      }
    }
  } else {
    cache[url] = {
      data: "",
      status: "",
    };
    request(
      url,
      (data) => {
        cache[url].data = data;
        cache[url].status = "success";
        successCallback(data);
        if (cache[url].queue && cache[url].queue.length > 0) {
          for (let i = 0; i < cache[url].queue.length; i++) {
            cache[url].queue[i].success(data);
          }
          cache[url].queue = [];
        }
      },
      (error) => {
        cache[url].data = error;
        cache[url].status = "fail";
        failCallback(error);
        if (cache[url].queue && cache[url].queue.length > 0) {
          for (let i = 0; i < cache[url].queue.length; i++) {
            cache[url].queue[i].fail(error);
          }
          cache[url].queue = [];
        }
      }
    );
  }
}

cacheRequest(
  "1.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "1.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "1.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "1.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "1.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "2.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "2.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
cacheRequest(
  "3.com",
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log(err);
  }
);
