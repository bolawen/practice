module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
    ],
    settings: {
        react: {
            pragma: 'React',
            version: 'detect',
        },
    },
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
    },
    rules: {
        '@typescript-eslint/no-unused-vars': 'off', //是否禁止未使用的变量
        '@typescript-eslint/no-var-requires': 'off', //是否禁止在 import 语句之外使用 require 语句
        '@typescript-eslint/explicit-module-boundary-types': 'off', //是否要求导出函数和类的公共类方法的显式返回和参数类型
        '@typescript-eslint/triple-slash-reference': 'off', //是否禁止使用/// <reference path="" />，/// <reference types="" />或/// <reference lib="" />指令
        '@typescript-eslint/no-inferrable-types': 0, //是否开启推断类型
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: 2, //分号 检测开关
    },
};
