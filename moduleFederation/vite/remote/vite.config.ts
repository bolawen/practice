import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  build: {
    target: 'esnext'
  },
  plugins: [
    vue(),
    federation({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './utils': './src/utils.ts',
        './Button': './src/components/Button.vue',
        
      },
      shared: ['vue']
    })
  ]
});
