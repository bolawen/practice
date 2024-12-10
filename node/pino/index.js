const Koa = require("koa");
const winston = require("winston");
const KoaRouter = require("koa-router");

const port = 3000;
const app = new Koa();
const router = new KoaRouter();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/backend-server.log" })  // 日志写入指定路径
  ],
});

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
