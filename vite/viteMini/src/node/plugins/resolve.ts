import path from 'path';
import resolve from 'resolve';
import { Plugin } from '../plugin';
import { pathExists } from 'fs-extra';
import { ServerContext } from '../server/index';
import { DEFAULT_EXTERNALS } from '../constants';
import { cleanUrl, normalizePath } from '../utils';

export function resolvePlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: 'm-vite:resolve',
    configureServer(s) {
      serverContext = s;
    },
    async resolveId(id: string, importer?: string) {
      if (path.isAbsolute(id)) {
        if (await pathExists(id)) {
          return { id };
        }
        id = path.join(serverContext.root, id);
        if (await pathExists(id)) {
          return { id };
        }
      }
      else if (id.startsWith('.')) {
        if (!importer) {
          throw new Error('`importer` should not be undefined');
        }
        const hasExtension = path.extname(id).length > 1;
        let resolvedId: string;
        if (hasExtension) {
          resolvedId = normalizePath(
            resolve.sync(id, { basedir: path.dirname(importer) })
          );
          if (await pathExists(resolvedId)) {
            return { id: resolvedId };
          }
        }
        else {
          for (const extname of DEFAULT_EXTERNALS) {
            try {
              const withExtension = `${id}${extname}`;
              resolvedId = normalizePath(
                resolve.sync(withExtension, {
                  basedir: path.dirname(importer)
                })
              );
              if (await pathExists(resolvedId)) {
                return { id: resolvedId };
              }
            } catch (e) {
              continue;
            }
          }
        }
      }
      return null;
    }
  };
}
