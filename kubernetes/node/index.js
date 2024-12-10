const Koa = require("koa");
const KoaRouter = require("koa-router");

const port = 3000;
const app = new Koa();
const router = new KoaRouter();

const PORT = process.env.APP_PORT || 3000;
const DB_PASSWORD = process.env.DB_PASSWORD;

console.log("------PORT------", PORT);
console.log("-------DB_PASSWORD--------", DB_PASSWORD);

router.get("/", async (ctx) => {
  ctx.body = {
    code: 200,
    message: "Hello Koa Server",
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Koa HTTP Server is running on port ${port}`);
});
