function compose(middleware) {
  if (!Array.isArray(middleware)) {
    throw new TypeError("middleware 必须为函数数组");
  }
  for (const fn of middleware) {
    if (typeof fn !== "function") {
      throw new TypeError("middleware 元素必须为函数");
    }
  }

  return function (context, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error("next() 函数不可以调用多次"));
      }
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) {
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

async function middleware1(ctx, next) {
  ctx.message = "aaa";
  await next();
  console.log(ctx.message);
}
async function middleware2(ctx, next) {
  ctx.message += "bbb";
  await next();
}

function promiseFun() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("ccc");
    }, 3000);
  });
}
async function middleware3(ctx, next) {
  const result = await promiseFun();
  ctx.message += result;
}

let middleware = [middleware1, middleware2, middleware3];
compose(middleware)({});
