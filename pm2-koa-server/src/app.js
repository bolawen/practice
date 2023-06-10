const Koa = require("koa");
const router = require("./router");

const app = new Koa();
app.use(router.routes());

app.listen(4000, () => {
  console.log("pm2-koa-server 启动成功！");
});
