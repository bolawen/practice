const path = require("path");
const { fork } = require("child_process");

const workerProcess01 = fork(path.resolve(__dirname, "support.js"), ["01"]);
// 主进程向子进程发送消息
workerProcess01.send("hello support process", () => {
  // 发送完消息后，需要关闭两个进程之间的通信，不然进程会一直等待，即光标会一直闪烁
  workerProcess01.disconnect();
});
// 主进程接收子进程消息
workerProcess01.on("message", (msg) => {
  console.log(msg);
});

workerProcess01.on("close", function (code) {
  console.log("子进程已退出，退出码 " + code);
});

const workerProcess02 = fork(path.resolve(__dirname, "support.js"), ["02"]);
workerProcess02.on("close", function (code) {
  console.log("子进程已退出，退出码 " + code);
});
