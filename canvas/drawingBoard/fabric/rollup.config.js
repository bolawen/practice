import JSON from '@rollup/plugin-json';
import CommonJS from '@rollup/plugin-commonjs';
import { string as String} from 'rollup-plugin-string';
import { nodeResolve as NodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js'
  },
  plugins: [
    JSON(),
    String({
      include: '**/*.html',
      exclude: ['**/index.html']
    }),
    CommonJS(),
    NodeResolve({
      extensions: ['.js', '.node'],
    }),
  ],
  external: ['fabric','https://cdn.jsdelivr.net/npm/fabric@5.3.0/+esm']
};
