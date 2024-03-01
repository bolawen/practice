import vue from '@vitejs/plugin-vue';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
    // fs: {
    //   allow: [
    //     searchForWorkspaceRoot(process.cwd()),
    //     '/mygit/micro-zoe/micro-app/'
    //   ]
    // }
  },
  base: '/vite-vue3-main/',
  build: {
    outDir: 'vite-vue3-main'
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => /^micro-app/.test(tag)
        }
      }
    })
  ]
});
