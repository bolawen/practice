module.exports = {
    arrowParens: 'always', //箭头函数，只有一个参数的时候，是否需要括号
    bracketSpacing: false, //大括号内的首尾是否需要空格
    eslintIntegration: true, //是否需要 prettier 使用 eslint 的代码格式进行校验
    insertPragma: false, //是否需要自动在文件开头插入 @prettier
    jsxBracketSameLine: true, // jsx 标签的反尖括号是否需要换行
    jsxSingleQuote: false, // jsx 是否需要将双引号转换为单引号
    printWidth: 80, //超过最大值换行
    requirePragma: false, //是否需要写文件开头的 @prettier
    semi: true, //行尾是否需要分号 （需要跟 eslint 保持一致）
    singleQuote: true, //是否需要将双引号转换为单引号
    trailingComma: 'all', //在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
    tabWidth: 4, //缩进字节数
    useTabs: false, //缩进是否使用 tab
};
