import RollupPluginCommonjs from '@rollup/plugin-commonjs';
import RollupPluginResolve from '@rollup/plugin-node-resolve';
import RollupPluginTypescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'packages/vue/index.ts',
    output: [
      {
        name: 'Vue',
        format: 'iife',
        sourcemap: true,
        file: './packages/vue/dist/vue.iife.js'
      }
    ],
    plugins: [
      RollupPluginResolve(),
      RollupPluginCommonjs(),
      RollupPluginTypescript({
        sourceMap: true
      })
    ]
  }
];
