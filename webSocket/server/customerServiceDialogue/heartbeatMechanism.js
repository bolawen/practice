const Koa = require("koa");
const HTTP = require("http");
const WebSocket = require("ws");
const KoaRouter = require("koa-router");

const app = new Koa();
const router = new KoaRouter();
const server = HTTP.createServer(app.callback());
const wss = new WebSocket.Server({ server });

const HEARTBEAT_INTERVAL = 30000; // 心跳间隔时间

// 心跳机制，定期检查连接
function setupHeartbeat(webSocket) {
  webSocket.isAlive = true; // 初始化心跳状态

  const interval = setInterval(() => {
    if (webSocket.isAlive === false) {
      console.log("Terminating WebSocket due to no heartbeat response.");
      return webSocket.terminate(); // 终止连接
    }
    webSocket.isAlive = false; // 设置为 false，等待响应
    webSocket.ping(); // 发送 ping
  }, HEARTBEAT_INTERVAL); // 每隔 HEARTBEAT_INTERVAL 秒检查一次

  webSocket.on("pong", () => {
    console.log("WebSockete pong received.");
    webSocket.isAlive = true; // 收到心跳回应
  });

  webSocket.on("close", () => {
    console.log("WebSocket closed 002");
    clearInterval(interval); // 清除心跳检查
  });
}

// WebSocket 连接处理
wss.on("connection", (ws) => {
  setupHeartbeat(ws); // 设置心跳机制

  ws.on("message", (message) => {
    console.log("Received message:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket closed 001");
  });
});

router.get("/", (ctx) => {
  ctx.body = "WebSocket Server Running";
});

app.use(router.routes()).use(router.allowedMethods());

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
