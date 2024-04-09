const path = require("path");
const { spawn } = require("child_process");

const workerProcess01 = spawn("node", [
  path.resolve(__dirname, "support.js"),
  "01",
]);
workerProcess01.stdout.on("data", function (data) {
  console.log("stdout: " + data);
});
workerProcess01.stderr.on("data", function (data) {
  console.log("stderr: " + data);
});
workerProcess01.on("close", function (code) {
  console.log("子进程已退出，退出码 " + code);
});

const workerProcess02 = spawn("node", [
  path.resolve(__dirname, "support.js"),
  "02",
]);
workerProcess02.stdout.on("data", function (data) {
  console.log("stdout: " + data);
});
workerProcess02.stderr.on("data", function (data) {
  console.log("stderr: " + data);
});
workerProcess02.on("close", function (code) {
  console.log("子进程已退出，退出码 " + code);
});
