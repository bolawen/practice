const FS = require("fs");
const WS = require("ws");
const Koa = require("koa");
const HTTP = require("http");
const Path = require("path");
const KoaStatic = require("koa-static");

const app = new Koa();
const clients = new Set();
const server = HTTP.createServer(app.callback());
const wss = new WS.Server({ server });
const uploadDir = Path.join(__dirname, "static");

app.use(KoaStatic(uploadDir));

function saveBufferToFile(buffer) {
  if (!FS.existsSync(uploadDir)) {
    FS.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}.png`;
  const filePath = Path.join(uploadDir, fileName);
  FS.writeFileSync(filePath, buffer);
  return filePath;
}

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    const buffer = Buffer.from(message);
    const savedFilePath = saveBufferToFile(buffer);
    console.log("File saved at:", savedFilePath)
    ws.send(`File saved at: ${savedFilePath}`);
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
