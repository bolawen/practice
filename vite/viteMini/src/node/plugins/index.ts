import { cssPlugin } from './css';
import { Plugin } from '../plugin';
import { assetPlugin } from "./assets";
import { resolvePlugin } from './resolve';
import { esbuildTransformPlugin } from './esbuild';
import { clientInjectPlugin } from './clientInject';
import { importAnalysisPlugin } from './importAnalysis';

export function resolvePlugins(): Plugin[] {
  return [
    clientInjectPlugin(),
    resolvePlugin(),
    esbuildTransformPlugin(),
    importAnalysisPlugin(),
    cssPlugin(),
    assetPlugin(),
  ];
}
