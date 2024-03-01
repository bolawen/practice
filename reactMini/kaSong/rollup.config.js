import Path from 'path';
import { fileURLToPath } from 'url';
import RollupAlias from '@rollup/plugin-alias';
import RollupPluginCommonjs from '@rollup/plugin-commonjs';
import RollupPluginResolve from '@rollup/plugin-node-resolve';

function getProjectRootDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = Path.dirname(__filename);
  return __dirname;
}

function resolve(...path) {
  const __dirname = getProjectRootDir();
  return Path.resolve(__dirname, ...path);
}

export default [
  {
    input: './packages/index.js',
    output: {
      name: 'React',
      format: 'iife',
      sourcemap: true,
      file: './dist/react.iife.js'
    },
    plugins: [
      RollupAlias({
        extensions: ['.js', '.jsx'],
        entries: [
          { find: 'react', replacement: resolve('./packages/react') },
          { find: 'shared', replacement: resolve('./packages/shared') },
          { find: 'react-dom', replacement: resolve('./packages/react-dom') },
          {
            find: 'react-reconciler',
            replacement: resolve('./packages/react-reconciler')
          }
        ]
      }),
      RollupPluginResolve(),
      RollupPluginCommonjs()
    ]
  },
];
