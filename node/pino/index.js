const Koa = require("koa");
const pino = require("pino");
const KoaRouter = require("koa-router");

const port = 3000;
const app = new Koa();
const router = new KoaRouter();

const logFile = pino.destination("logs/backend-server.log");
const logger = pino(logFile);

router.get("/", (ctx) => {
  logger.info("Hello again distributed logs");

  ctx.body = {
    code: 200,
    message: "成功！",
  };
});

app.use(router.routes());

app.listen(port, () => {
  console.log(`Service is running ${port}`);
});
