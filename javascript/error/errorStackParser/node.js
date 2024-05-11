process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err.message, err.stack);
  process.exit(1);
});

process.on("unhandledRejection", function (reason, promise) {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

function test() {
  throw new Error("test");
}

test();
