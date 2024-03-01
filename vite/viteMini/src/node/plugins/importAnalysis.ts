import path from 'path';
import resolve from 'resolve';
import { Plugin } from '../plugin';
import { pathExists } from 'fs-extra';
import MagicString from 'magic-string';
import { init, parse } from 'es-module-lexer';
import { ServerContext } from '../server/index';
import {
  BARE_IMPORT_RE,
  PRE_BUNDLE_DIR,
  DEFAULT_EXTERNALS,
  CLIENT_PUBLIC_PATH
} from '../constants';
import { cleanUrl, getShortName, isInternalRequest, isJSRequest, normalizePath } from '../utils';

export function importAnalysisPlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: 'm-vite:import-analysis',
    configureServer(s) {
      serverContext = s;
    },
    async transform(code: string, id: string) {
      if (!isJSRequest(id) || isInternalRequest(id)) {
        return null;
      }
      await init;
      const importedModules = new Set<string>();
      const [imports] = parse(code);
      const ms = new MagicString(code);

      const resolve = async (id: string, importer?: string) => {
        const resolved = await serverContext.pluginContainer.resolveId(
          id,
          normalizePath(importer)
        );
        if (!resolved) {
          return;
        }
        let resolvedId = `/${getShortName(resolved.id, serverContext.root)}`;
        return resolvedId;
      };

      const { moduleGraph } = serverContext;
      const curMod = moduleGraph.getModuleById(id)!;

      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modSource } = importInfo;
        if (!modSource) continue;

        if (modSource.endsWith('.svg')) {
          const resolvedUrl = await resolve(modSource, id);
          ms.overwrite(modStart, modEnd, `${resolvedUrl}?import`);
          continue;
        }

        if (BARE_IMPORT_RE.test(modSource)) {
          const bundlePath = normalizePath(
            path.join('/', PRE_BUNDLE_DIR, `${modSource}.js`)
          );
          ms.overwrite(modStart, modEnd, bundlePath);
          importedModules.add(bundlePath);
        } else if (modSource.startsWith('.') || modSource.startsWith('/')) {
          const resolved = await resolve(modSource, id);
          if (resolved) {
            ms.overwrite(modStart, modEnd, resolved);
            importedModules.add(resolved);
          }
        }
      }

      if (!id.includes('node_modules')) {
        // 注入 HMR 相关的工具函数
        ms.prepend(
          `import { createHotContext as __vite__createHotContext } from "${CLIENT_PUBLIC_PATH}";` +
            `import.meta.hot = __vite__createHotContext(${JSON.stringify(
              cleanUrl(curMod.url)
            )});`
        );
      }

      moduleGraph.updateModuleInfo(curMod, importedModules);

      return {
        code: ms.toString(),
        map: ms.generateMap()
      };
    }
  };
}
