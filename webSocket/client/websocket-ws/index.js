const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", () => {
  console.log("WebSocket 连接成功");
  socket.send("Hello WebSocket");
});

socket.addEventListener("message", (event) => {
  console.log("接收到服务端消息: %s", event.data);
});

socket.addEventListener("close", () => {
  console.log("WebSocket 连接关闭");
});

socket.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});
