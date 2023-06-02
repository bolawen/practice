module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
        commonjs: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: [
        'eslint:recommended',
        'airbnb',
        'prettier',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:react/jsx-runtime',
    ],
    plugins: [
        'react',
        'react-hooks',
        'import',
        'prettier',
        '@typescript-eslint',
    ],
    rules: {
        semi: 2,
        'no-unused-vars': 0,
        'import/no-unresolved': [
            2,
            {
                ignore: ['^@/'], // @ 是设置的路径别名
            },
        ],
        'import/extensions': [
            'error',
            {
                ignorePackages: true,
                pattern: {
                    js: 'always',
                    jsx: 'never',
                    ts: 'never',
                    tsx: 'never',
                    scss: 'never',
                    vue: 'always',
                    png: 'always',
                    jpg: 'always',
                    svg: 'always',
                },
            },
        ],
        'react/jsx-filename-extension': [1, {extensions: ['.js', '.tsx']}],
        'react/display-name': 0,
        'react/jsx-props-no-spreading': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-var-requires': 'off',
        'react/function-component-definition': 0,
        'react/prefer-stateless-function': [0],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'import/no-extraneous-dependencies': [
            'error',
            {devDependencies: ['vite.config.ts']},
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
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
        },
        'import/extensions': [
            '.js',
            '.ts',
            '.jsx',
            '.tsx',
            '.json',
            '.scss',
            '.less',
        ],
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
    },
};
