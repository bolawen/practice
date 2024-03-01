import path from 'path';
import { fileURLToPath } from 'url';
import { ViteDevServer } from 'vite';

export function getProjectRootDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return __dirname;
}

export function resolve(...pathArray) {
  const __dirname = getProjectRootDir();
  return path.resolve(__dirname, ...pathArray);
}

export function resolveTemplatePath(isProd, root) {
  return isProd
    ? path.join(root, 'dist/client/index.html')
    : path.join(root, 'index.html');
}

export async function loadSsrEntryModule(
  vite: ViteDevServer | null,
  isProd,
  root
) {
  if (isProd) {
    // 生产模式下直接 require 打包后的产物
    const entryPath = path.join(root, 'dist/server/entry-server.js');
    return await import(entryPath);
  } else {
    // 开发环境下通过 no-bundle 方式加载
    const entryPath = path.join(root, 'src/entry-server.tsx');
    return vite!.ssrLoadModule(entryPath);
  }
}

export async function fetchData() {
  return { user: 'xxx' };
}

export function matchPageUrl(url: string) {
  if (url === '/') {
    return true;
  }
  return false;
}