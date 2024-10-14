const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello, Express with HTTP!");
});

server.listen(8000, () => {
  console.log("Express HTTP Server is running on port 8000");
});
