import connect from 'connect';
import { Plugin } from "../plugin";
import { normalizePath } from "../utils";
import { blue, green } from 'picocolors';
import { bindingHMREvents } from "../hmr";
import { resolvePlugins } from '../plugins';
import { ModuleGraph } from "../ModuleGraph";
import { createWebSocketServer } from '../ws';
import { optimize } from '../optimizer/index';
import chokidar, { FSWatcher } from "chokidar";
import { staticMiddleware } from "./middlewares/static";
import { transformMiddleware } from './middlewares/transform';
import { indexHtmlMiddleware } from "./middlewares/indexHtml";
import { createPluginContainer, PluginContainer } from '../pluginContainer';

export interface ServerContext {
  root: string;
  pluginContainer: PluginContainer;
  app: connect.Server;
  plugins: Plugin[];
  moduleGraph: ModuleGraph;
  ws: { send: (data: any) => void; close: () => void };
  watcher: FSWatcher;
}

export async function startDevServer() {
  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();

  const plugins = resolvePlugins();
  const pluginContainer = createPluginContainer(plugins);
  const watcher = chokidar.watch(root, {
    ignored: ["**/node_modules/**", "**/.git/**"],
    ignoreInitial: true,
  });
  const ws = createWebSocketServer(app);

  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url));
  const serverContext: ServerContext = {
    root: normalizePath(process.cwd()),
    app,
    pluginContainer,
    plugins,
    moduleGraph,
    ws,
    watcher
  };

  bindingHMREvents(serverContext);

  for (const plugin of plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(serverContext);
    }
  }


  app.use(transformMiddleware(serverContext));
  app.use(indexHtmlMiddleware(serverContext));
  app.use(staticMiddleware(serverContext.root));

  app.listen(3000, async () => {
    await optimize(root);

    console.log(
      green('🚀 No-Bundle 服务已经成功启动!'),
      `耗时: ${Date.now() - startTime}ms`
    );
    console.log(`> 本地访问路径: ${blue('http://localhost:3000')}`);
  });
}
