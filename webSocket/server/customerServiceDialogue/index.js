const Koa = require("koa");
const HTTP = require("http");
const WebSocket = require("ws");
const KoaRouter = require("koa-router");

const app = new Koa();
const router = new KoaRouter();
const server = HTTP.createServer(app.callback());
const wss = new WebSocket.Server({ server });

const connectedClients = new Map(); // 存储用户和客服的连接
const waitingUsersQueue = []; // 存储等待的用户
const availableSupportAgents = new Map(); // 存储客服
const supportAgentStates = new Map(); // 存储客服状态

// 客服状态常量
const SUPPORT_STATES = {
  FREE: "free",
  BUSY: "busy",
  OFFLINE: "offline",
};

// 分配客服给用户
function assignSupportAgent(userId, userSocket) {
  // 检查可用客服
  const availableAgents = Array.from(availableSupportAgents.keys()).filter(
    (agentId) => supportAgentStates.get(agentId) === SUPPORT_STATES.FREE
  );

  if (availableAgents.length === 0) {
    waitingUsersQueue.push(userId); // 将用户添加到等待队列
    userSocket.send(
      JSON.stringify({
        type: "waiting",
        message: "No support available, please wait.",
      })
    );
    return;
  }

  // 分配一个空闲客服
  const supportId = availableAgents[0];
  const supportSocket = availableSupportAgents.get(supportId);
  supportAgentStates.set(supportId, SUPPORT_STATES.BUSY); // 更新客服状态
  supportSocket.send(JSON.stringify({ userId, type: "new_user" }));
  userSocket.send(JSON.stringify({ type: "connected", supportId }));
}

// 将客服与等待用户配对
function assignUserToSupportAgent(supportId) {
  const userId = waitingUsersQueue.shift(); // 获取并移除第一个等待用户
  if (!userId) return;

  const userSocket = connectedClients.get(userId);
  userSocket.send(JSON.stringify({ type: "connected", supportId }));
  const supportSocket = availableSupportAgents.get(supportId);
  supportSocket.send(JSON.stringify({ userId, type: "new_user" }));
  supportAgentStates.set(supportId, SUPPORT_STATES.BUSY); // 更新客服状态
}

// 处理消息
function processIncomingMessage(message, senderId) {
  try {
    const { text, type, recipientId } = JSON.parse(message);
    const recipientSocket = connectedClients.get(recipientId);
    if (recipientSocket) {
      recipientSocket.send(JSON.stringify({ text, type, senderId }));
    } else {
      console.error(`Recipient ${recipientId} not found`);
    }
  } catch (error) {
    console.error("Message handling error", error);
  }
}

// 清理用户连接
function removeUserConnection(userId, role) {
  connectedClients.delete(userId); // 从 connectedClients 中删除
  if (role === "user") {
    const index = waitingUsersQueue.indexOf(userId);
    if (index > -1) {
      waitingUsersQueue.splice(index, 1); // 从等待队列中移除
    }
  } else if (role === "support") {
    availableSupportAgents.delete(userId); // 从可用客服中移除
    supportAgentStates.delete(userId); // 从客服状态中移除
    // 尝试分配等待用户
    if (waitingUsersQueue.length > 0) {
      assignUserToSupportAgent(userId); // 尝试分配用户
    }
  }
}

// 心跳机制，定期检查连接
function setupHeartbeat(webSocket) {
  const interval = setInterval(() => {
    if (webSocket.isAlive === false) return webSocket.terminate();
    webSocket.isAlive = false;
    webSocket.send(JSON.stringify({ type: "heartbeat" }));
  }, 30000); // 每30秒检查一次

  webSocket.on("pong", () => {
    webSocket.isAlive = true; // 收到心跳回应
  });

  webSocket.on("close", () => {
    clearInterval(interval);
  });
}

// WebSocket 连接处理
wss.on("connection", (webSocket, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const role = url.searchParams.get("role");
  const userId = url.searchParams.get("user-id");

  if (!userId || !role) {
    webSocket.close(4000, "User Id and Role are required");
    return;
  }

  connectedClients.set(userId, webSocket); // 存储连接
  webSocket.isAlive = true; // 初始化心跳状态
  setupHeartbeat(webSocket); // 设置心跳机制

  if (role === "user") {
    assignSupportAgent(userId, webSocket); // 分配客服
  } else {
    availableSupportAgents.set(userId, webSocket); // 存储客服连接
    supportAgentStates.set(userId, SUPPORT_STATES.FREE); // 初始化客服状态为空闲
    assignUserToSupportAgent(userId); // 尝试分配用户
  }

  webSocket.on("message", (message) => {
    processIncomingMessage(message, userId); // 处理消息
  });

  webSocket.on("close", () => {
    removeUserConnection(userId, role); // 清理连接
  });
});

// 路由设置
router.get("/", (ctx) => {
  ctx.body = "Hello World";
});

// 应用中间件
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
server.listen(3000, () => {
  console.log("Server started on port 3000");
});
