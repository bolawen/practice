const Koa = require("koa");
const http = require("http");
const WebSocket = require("ws");

const port = 3000;
const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });

// WebSocket 连接事件
wss.on("connection", (ws)=>{
    console.log("WebSocket 连接成功");

    // WebSocket 消息事件
    ws.on("message", (message)=>{
        console.log("接收到客户端消息: %s", message);
        ws.send("服务端回复: " + message);
    });

    // WebSocket 关闭事件
    ws.on("close", ()=>{
        console.log("WebSocket 连接关闭");
    });
});

app.use((ctx)=>{
    ctx.body = "WebSocket 服务正在运行";
});

server.listen(port, ()=>{
    console.log("Server is running at http://localhost:%d", port);
});