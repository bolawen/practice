function compose(req, res, middleware) {
  const next = () => {
    const fn = middleware.shift();
    if (fn) {
      fn(req, res, next);
    }
  };
  next();
}

async function middleware1(req, res, next) {
  req.message = "aaa";
  await next();
  console.log(req.message);
}
async function middleware2(req, res, next) {
  req.message += "bbb";
  await next();
}

function promiseFun() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("ccc");
    }, 3000);
  });
}
async function middleware3(req, res, next) {
  const result = await promiseFun();
  req.message += result;
}

const req = {};
const res = {};
const middleware = [middleware1, middleware2, middleware3];
compose(req, res, middleware);
