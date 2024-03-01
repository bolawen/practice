import * as magic_string from 'magic-string';

interface RollupOptions {
    input: string;
    output: string;
}
declare function rollup(options: RollupOptions): Promise<{
    generate: () => {
        code: string;
        map: magic_string.SourceMap;
    };
    write: () => Promise<[unknown, unknown]>;
}>;

export { type RollupOptions, rollup };
