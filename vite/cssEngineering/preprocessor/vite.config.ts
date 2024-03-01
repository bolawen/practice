import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';

const baseMap: { [key: string]: string } = {
  development: '/',
  production: '/test/vite/cssEngineering/preprocessor/dist'
};

export default defineConfig({
  base: baseMap[process.env.NODE_ENV],
  plugins: [
    react(),
    visualizer({
      open: true
    })
  ],
  build: {
    target: 'es2015',
    minify: 'esbuild'
  }
});
