process.on("message", (msg) => {
  console.log("msg", msg);
});
process.send("hello master process");

console.log("进程" + process.argv[2] + "执行完毕");
