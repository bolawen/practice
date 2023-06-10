const Router = require("koa-router");

const router = new Router();

router.get("/", (ctx) => {
  ctx.body = "pm2-koa-server";
});

module.exports = router;
