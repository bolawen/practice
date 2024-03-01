import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    vue(),
    federation({
      name: 'hostApp',
      remotes: {
        remoteApp: 'http://localhost:5173/assets/remoteEntry.js'
      },
      shared: ['vue']
    })
  ]
});
