const http = require("http");
const os = require("os");
const PORT = 3000;

const getIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "0.0.0.0";
};

const server = http.createServer((req, res) => {
  const containerIp = getIpAddress();
  const requestIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end(
    `Hello from Node.js\nYour IP address is ${requestIp}\nContainer IP address is ${containerIp}\n`
  );
});

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
