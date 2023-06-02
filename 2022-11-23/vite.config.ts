import Path from 'path';
import {defineConfig} from 'vite';
import ReactPlugin from '@vitejs/plugin-react';

export default ({comman, code}) =>
    defineConfig({
        plugins: [ReactPlugin()],
        resolve: {
            alias: {
                '@': Path.resolve(__dirname, 'src'),
            },
            extensions: [
                '.js',
                '.ts',
                '.jsx',
                '.tsx',
                '.json',
                '.scss',
                '.less',
            ],
        },
    });
