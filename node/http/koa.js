const Koa = require("koa");
const http = require("http");

const app = new Koa();
const server = http.createServer(app.callback());

app.use((ctx) => {
  ctx.type = "application/json";

  ctx.body = JSON.stringify({
    data: "Hello World!",
  });
});

server.listen(8000, () => {
  console.log("Koa HTTP Server is running on port 8000");
});
