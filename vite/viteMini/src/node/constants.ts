import path from 'path';

export const EXTERNAL_TYPES = [
  'css',
  'less',
  'sass',
  'scss',
  'styl',
  'stylus',
  'pcss',
  'postcss',
  'vue',
  'svelte',
  'marko',
  'astro',
  'png',
  'jpe?g',
  'gif',
  'svg',
  'ico',
  'webp',
  'avif'
];

export const HMR_PORT = 24678;
export const HASH_RE = /#.*$/s;
export const QUERY_RE = /\?.*$/s;
export const BARE_IMPORT_RE = /^[\w@][^:]/;
export const CLIENT_PUBLIC_PATH = "/@vite/client";
export const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/;
export const DEFAULT_EXTERNALS = ['.tsx', '.ts', '.jsx', 'js'];
export const PRE_BUNDLE_DIR = path.join('node_modules', '.m-vite');
