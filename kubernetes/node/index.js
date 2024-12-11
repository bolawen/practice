const Koa = require("koa");
const pino = require("pino");
const KoaRouter = require("koa-router");

const port = 3000;
const app = new Koa();
const router = new KoaRouter();

const logFilePath =
  process.env.APP_ENV === "development" || !process.env.APP_ENV
    ? "logs/backend-server.log"
    : "/logs/backend-server.log";

const logFile = pino.destination(logFilePath);
const logger = pino(logFile);

const PORT = process.env.APP_PORT || 3000;
const DB_PASSWORD = process.env.DB_PASSWORD;

console.log("------PORT------", PORT);
console.log("-------DB_PASSWORD--------", DB_PASSWORD);

router.get("/", async (ctx) => {
  logger.info("Hello again distributed logs");
  ctx.body = {
    code: 200,
    message: "Hello Koa Server 001",
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Koa HTTP Server is running on port ${port}`);
});
