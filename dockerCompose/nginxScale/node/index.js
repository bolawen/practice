const Koa = require("koa");
const KoaRouter = require("koa-router");

const app = new Koa();
const router = new KoaRouter();

router.get("/", async (ctx) => {
  ctx.body = "Hello World!";
});

app.use(router.routes());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
