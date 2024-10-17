const FS = require("fs");
const WS = require("ws");
const Koa = require("koa");
const HTTP = require("http");
const Path = require("path");
const KoaBody = require("koa-body");
const KoaCors = require("@koa/cors");
const KoaRouter = require("koa-router");
const KoaStatic = require("koa-static");

const PORT = 3000;
const app = new Koa();
const clients = new Set();
const { koaBody } = KoaBody;
const router = new KoaRouter();
const server = HTTP.createServer(app.callback());
const wss = new WS.Server({ server });
const staticDir = Path.join(__dirname, "static");
const uploadDir = Path.join(staticDir, "uploads");

if (!FS.existsSync(uploadDir)) {
  FS.mkdirSync(uploadDir, { recursive: true });
}

function processUploadBase(data, filename) {
  const filenameNew = filename ?? `${Date.now()}.png`;
  const filePath = Path.join(uploadDir, filenameNew);
  FS.writeFileSync(filePath, data);
  return "http://localhost:3000/uploads/" + filenameNew;
}

function processUploadForFile(file) {
  // 读取文件内容: 读取的是文件的临时路径，这是在上传过程中生成的，Koa 的 koa-body 中间件会将上传的文件保存到临时目录，并提供这个路径。因此，您可以通过这个路径读取文件。
  const buffer = FS.readFileSync(file.filepath);
  const fileUrl = processUploadBase(buffer);
  return fileUrl;
}

function processUploadForBase64(base64) {
  const base64Data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const fileUrl = processUploadBase(buffer);
  return fileUrl;
}

function processUploadForBuffer(buffer) {
  const bufferNew = Buffer.from(buffer, "binary");
  const fileUrl = processUploadBase(bufferNew);
  return fileUrl;
}

function receiveHttpStreamData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });
}

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    const fileUrl = processUploadForBuffer(message);
    console.log("Websocket URL fileUrl", fileUrl);
    ws.send(`fileURL: ${fileUrl}`);
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

router.get("/", (ctx) => {
  ctx.body = "Hello, Koa!";
});

router.post("/upload", async (ctx) => {
  const { files, body } = ctx.request;
  const contentType = ctx.request.headers["content-type"];

  let fileUrl = null;

  if (files?.file || body?.file) {
    const file = files?.file || body?.file;
    fileUrl = processUploadForFile(file);
  } else if (files?.base64 || body?.base64) {
    const base64 = files?.base64 || body?.base64;
    fileUrl = processUploadForBase64(base64);
  } else if (files?.blob || body?.blob) {
    const blob = files?.blob || body?.blob;
    fileUrl = processUploadForFile(blob);
  } else if (
    contentType === "application/octet-stream" ||
    files?.buffer ||
    body?.buffer
  ) {
    const buffer =
      files?.buffer || body?.buffer || (await receiveHttpStreamData(ctx.req));
    fileUrl = processUploadForBuffer(buffer);
  }

  ctx.body = {
    code: 200,
    data: fileUrl,
    message: "File uploaded",
  };
});

app.use(
  KoaCors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  koaBody({
    text: true,
    json: true,
    multipart: true,
    urlencoded: true,
    encoding: "gzip",
    formidable: {
      uploadDir: uploadDir,
      keepExtensions: true,
    },
  })
);
app.use(KoaStatic(staticDir));

app.use(router.routes()).use(router.allowedMethods());
server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
