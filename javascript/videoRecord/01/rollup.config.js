import JSON from '@rollup/plugin-json';
import CommonJS from '@rollup/plugin-commonjs';
import { string as String} from 'rollup-plugin-string';
import { nodeResolve as NodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: {
    'recorder': 'recorder/recorder.js',
  },
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
    NodeResolve()
  ]
};
