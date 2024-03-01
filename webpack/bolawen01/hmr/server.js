const Path = require('path');
const mime = require('mime');
const http = require('http');
const express = require('express');
const webpack = require('webpack');
const socketIo = require('socket.io');
const MemoryFileSystem = require('memory-fs');
const webpackConfig = require('./webpack.config.js');

class Server {
  constructor(compiler) {
    this.compiler = compiler;

    let sockets = [];
    let lastHash;

    compiler.hooks.done.tap('webpack-dev-server', stats => {
      lastHash = stats.hash;

      sockets.forEach(socket => {
        console.log('stats.hash', stats.hash);
        socket.emit('hash', stats.hash);
        socket.emit('ok');
      });
    });

    let app = new express();

    compiler.watch({}, err => {
      console.log('编译完成');
    });

    let fs = new MemoryFileSystem();
    compiler.outputFileSystem = fs;

    function middleware(req, res, next) {
      if (req.url === '/favicon.ico') {
        return res.sendStatus(404);
      }

      try {
        let filename = Path.join(webpackConfig.output.path, req.url.slice(1));
        let stat = fs.statSync(filename);

        if (stat.isFile()) {
          let content = fs.readFileSync(filename);
          let contentType = mime.getType(filename);
          res.setHeader('Content-Type', contentType);
          res.statusCode = res.statusCode || 200;
          res.send(content);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        return res.sendStatus(404);
      }
    }

    app.use(middleware);

    this.server = http.createServer(app);
    let io = socketIo(this.server);

    io.on('connection', socket => {
      sockets.push(socket);
      socket.emit('hash', '');
      socket.emit('ok');
    });
  }

  listen(port) {
    this.server.listen(port, () => {
      console.log(`server start ${port}`);
    });
  }
}

const compiler = webpack(webpackConfig);
let server = new Server(compiler);
server.listen(4000);
