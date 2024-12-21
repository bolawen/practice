const os = require("os");
const fs = require("fs");
const Koa = require("koa");
const path = require("path");
const heapdump = require("heapdump");
const KoaRouter = require("koa-router");

const PORT = 3000;
const app = new Koa();
const router = new KoaRouter();

const CONFIG = {
  authToken: "bolawen", // 权限校验 Token
  heapSnapshotDir: path.resolve(__dirname, "heapdump"), // 堆快照目录
  memoryLimit: os.totalmem() * 0.8, // 内存使用警戒值 (80% 总内存)
  memoryThreshold: 100 * 1024 * 1024, // 内存增长阈值 (100MB)
  snapshotInterval: 60000 * 2, // 堆快照间隔 (2 分钟)
  requestSnapshotSteps: [10, 20], // 请求触发堆快照的步长
};

let requestCount = 0;
let heapdumpCounter = 0;
let lastMemoryUsage = process.memoryUsage().heapUsed;

if (!fs.existsSync(CONFIG.heapSnapshotDir)) {
  fs.mkdirSync(CONFIG.heapSnapshotDir, { recursive: true });
}

function triggerGc(onError, onSuccess) {
  if (global.gc) {
    global.gc();
    onSuccess?.();
  } else {
    onError?.();
  }
}

function generateHeapSnapshot(snapshotType, onError, onSuccess) {
  triggerGc();

  const filename = path.join(
    CONFIG.heapSnapshotDir,
    `heapdump-${snapshotType}-${Date.now()}.heapsnapshot`
  );
  heapdump.writeSnapshot(filename, (err, file) => {
    if (err) {
      console.error(`Error writing heap snapshot (${snapshotType}):`, err);
      onError?.(err);
    } else {
      console.log(`Heap snapshot (${snapshotType}) saved to ${file}`);
      onSuccess?.(file);
    }
  });
}

async function validateAuthTokenMiddleware(ctx, next) {
  const token = ctx.headers["x-auth-token"];
  if (!token || token !== CONFIG.authToken) {
    ctx.status = 403;
    ctx.body = { message: "Unauthorized: Invalid token" };
    return;
  }
  await next();
}

async function trackRequestCountMiddleware(ctx, next) {
  requestCount++;
  console.log(`Request count: ${requestCount}`);

  if (CONFIG.requestSnapshotSteps.includes(requestCount)) {
    console.log(`Taking heap snapshot after ${requestCount} requests`);
    generateHeapSnapshot(`request-${requestCount}`);
  }
  await next();
}

function generateStartupHeapSnapshot() {
  generateHeapSnapshot("startup");
}

function checkMemoryUsage() {
  const currentMemoryUsage = process.memoryUsage().heapUsed;
  console.log(`Memory usage: ${currentMemoryUsage} bytes`);

  if (currentMemoryUsage - lastMemoryUsage > CONFIG.memoryThreshold) {
    console.log(
      "Memory usage increased significantly. Taking heap snapshot..."
    );
    generateHeapSnapshot("memory-increase");
    lastMemoryUsage = currentMemoryUsage;
  }

  if (currentMemoryUsage >= CONFIG.memoryLimit) {
    console.warn("Memory usage critical! Taking heap snapshot...");
    generateHeapSnapshot("memory-critical");
  }
}

router.post("/heap-snapshot", validateAuthTokenMiddleware, async (ctx) => {
  generateHeapSnapshot(
    `manual-${++heapdumpCounter}`,
    (err) => {
      ctx.status = 500;
      ctx.body = {
        message: "Failed to write heap snapshot",
        error: err.message,
      };
    },
    (file) => {
      ctx.body = { message: "Heap snapshot generated", filename: file };
    }
  );
});

router.post("/trigger-gc", validateAuthTokenMiddleware, async (ctx) => {
  triggerGc(
    () => {
      ctx.status = 500;
      ctx.body = {
        message: "GC is not exposed. Start the app with --expose-gc",
      };
    },
    () => {
      ctx.body = { message: "Garbage Collection triggered manually" };
      console.log("Manual GC triggered");
    }
  );
});

router.get("/", trackRequestCountMiddleware, (ctx) => {
  ctx.body = { code: 200, message: "成功！" };
});

function startMonitoring() {
  setInterval(checkMemoryUsage, CONFIG.snapshotInterval);
}

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Service is running on http://localhost:${PORT}`);
  generateStartupHeapSnapshot();
  startMonitoring();
});
