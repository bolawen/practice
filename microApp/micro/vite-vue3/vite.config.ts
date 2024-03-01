import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { join } from 'path';
import { writeFileSync } from 'fs';

export default defineConfig({
  server: {
    port: 4007,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: `${
    process.env.NODE_ENV === 'production' ? 'https://bolawen.com' : ''
  }/vite-vue3-micro/`,
  build: {
    outDir: 'vite'
  },
  plugins: [
    vue(),
    (function () {
      let basePath = '';
      return {
        name: 'vite:micro-app',
        apply: 'build',
        configResolved(config) {
          basePath = `${config.base}${config.build.assetsDir}/`;
        },
        writeBundle(options, bundle) {
          for (const chunkName in bundle) {
            if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
              const chunk = bundle[chunkName];
              if (chunk.fileName && chunk.fileName.endsWith('.js')) {
                chunk.code = chunk.code.replace(
                  /(from|import\()(\s*['"])(\.\.?\/)/g,
                  (all, $1, $2, $3) => {
                    return all.replace($3, new URL($3, basePath));
                  }
                );
                const fullPath = join(options.dir, chunk.fileName);
                writeFileSync(fullPath, chunk.code);
              }
            }
          }
        }
      };
    })() as any
  ]
});
