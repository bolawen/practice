import * as fs from 'fs';
import { Plugin, transformWithEsbuild } from 'vite';

export default function vitePluginSvgr(): Plugin {

  return {
    name: 'vite-plugin-svgr',
    async transform(code, id) {

      if (!id.endsWith('.svg')) {
        return code;
      }

      const { transform } = await import("@svgr/core");
      const { default: jsx } = await import("@svgr/plugin-jsx");

      const filePath = String(id);
      const svgCode = await fs.promises.readFile(filePath, "utf8");

      const componentCode = await transform(svgCode, {}, {
        filePath,
        caller: {
          defaultPlugins: [jsx],
        },
      });

      const result = await transformWithEsbuild(componentCode, id, {
        loader: 'jsx',
      });

      return {
        map: null,
        code: result.code,
      };
    }
  };
}
