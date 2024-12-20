const http = require('http');

const leaks = [];
const server = http.createServer((req, res) => {
  leaks.push(new Array(1000000).fill('*')); // 内存泄漏
  res.end('Memory Leak Test');
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});