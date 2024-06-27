const Koa = require("koa");
const Router = require("koa-router");

const app = new Koa();
const router = new Router();
const port = process.env.port || 3000;

router.get("/", (ctx) => {
  ctx.body = "Hello World!";
});

app.use(router.routes());
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
