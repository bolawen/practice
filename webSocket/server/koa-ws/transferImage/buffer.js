const FS = require("fs");
const WS = require("ws");
const Koa = require("koa");
const HTTP = require("http");
const Path = require("path");
const KoaRouter = require("koa-router");
const KoaStatic = require("koa-static");

const app = new Koa();
const clients = new Set();
const router = new KoaRouter();
const server = HTTP.createServer(app.callback());
const wss = new WS.Server({ server });
const staticDir = Path.join(__dirname, "static");
const uploadDir = Path.join(staticDir, "uploads");

function processUploadBase(data, filename) {
  const filePath = Path.join(uploadDir, filename);
  FS.writeFileSync(filePath, data);
  return "http://localhost:3000/uploads/" + filename;
}

function processUploadForFile(file, filename) {
  const buffer = FS.readFileSync(file.path);
  const filenameNew = filename ?? `file_${Date.now()}.png`;
  const fileUrl = processUploadBase(buffer, filenameNew);
  return fileUrl;
}

function processUploadForBlob() {}

function processUploadForBase64() {}

function processUploadForBuffer() {}

function getUploadedFileURL(fileName) {
  return `http://localhost:3000/uploads/${fileName}`;
}

function saveUploadedFile() {}

function saveUploadedBufferToFile(buffer) {
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
    const savedFilePath = saveUploadedBufferToFile(buffer);
    const fileURL = getUploadedFileURL(Path.basename(savedFilePath));
    console.log("fileURL:", fileURL);
    ws.send(`fileURL: ${savedFilePath}`);
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

router.post("/upload", async () => {
  const file = ctx.request.files.file;
});

app.use(KoaStatic(staticDir));
app.use();

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
