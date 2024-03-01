import fs from 'fs';
import React from 'react';
import express from 'express';
import serverStatic from 'serve-static';
import { renderToString } from 'react-dom/server';
import { createServer as createViteServer } from 'vite';
import {
  fetchData,
  loadSsrEntryModule,
  matchPageUrl,
  resolve,
  resolveTemplatePath
} from './util';

const root = resolve('../', '../');
const isProd = process.env.NODE_ENV === 'production';

async function ssrSeverMiddleware(vite) {
  return async (req, res, next) => {
    try {
      // 1. 加载服务端入口模块
      const url = req.originalUrl;

      if (!matchPageUrl(url)) {
        // 走静态资源的处理
        return await next();
      }

      const { ServerEntry } = await loadSsrEntryModule(vite, isProd, root);
      // 2. 数据预取
      const data = await fetchData();
      // 3. 组件渲染 -> 字符串
      const appHtml = renderToString(
        React.createElement(ServerEntry, { data })
      );
      // 4. 拼接完整 HTML 字符串，返回客户端
      const templatePath = resolveTemplatePath(isProd, root);
      let template = await fs.readFileSync(templatePath, 'utf-8');

      // 开发模式下需要注入 HMR、环境变量相关的代码，因此需要调用 vite.transformIndexHtml
      if (!isProd && vite) {
        template = await vite.transformIndexHtml(url, template);
      }
      const html = template
        .replace('<!-- SSR_APP -->', appHtml)
        .replace(
          '<!-- SSR_DATA -->',
          `<script>window.__SSR_DATA__=${JSON.stringify(data)}</script>`
        );

      res.status(200).setHeader('Content-Type', 'text/html').end(html);
      
    } catch (error) {
      vite.ssrFixStacktrace(error);
      next(error);
    }
  };
}

async function createServer() {
  const app = express();

  /**
   * @description: 以中间件模式创建 Vite 应用
   * 1. appType: 'custom' 表示禁用 Vite 自身的 HTML 服务逻辑, 并让上级服务器接管控制
   * 2. server: { middlewareMode: true }
   */
  const vite = await createViteServer({
    appType: 'custom',
    server: { middlewareMode: true }
  });

  /**
   * @description: 使用 vite 的 Connect 实例作为中间件
   */
  app.use((req, res, next) => {
    vite.middlewares.handle(req, res, next);
  });

  app.use('*', await ssrSeverMiddleware(vite));

  // 注册中间件，生产环境端处理客户端资源
  if (isProd) {
    app.use(serverStatic(resolve(root, 'dist/client')));
  }

  app.listen(3000, () => {
    console.log('server is running at http://localhost:3000');
  });
}

createServer();
