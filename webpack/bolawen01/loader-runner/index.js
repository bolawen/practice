const Fs = require('fs');
const Path = require('path');
const { runLoaders } = require('./core/index.js');

const filePath = Path.resolve(__dirname, './test.js');
const request = 'inline1-loader!inline2-loader!./test.js';

const rules = [
  {
    test: /\.js$/,
    use: ['normal1-loader', 'normal2-loader']
  },
  {
    test: /\.js$/,
    use: ['pre1-loader', 'pre2-loader'],
    enforce: 'pre'
  },
  {
    test: /\.js$/,
    enforce: 'post',
    use: ['post1-loader', 'post2-loader']
  }
];

const parts = request.replace(/^-?!+/, '').split('!');
const sourcePath = parts.pop();

const inlineLoaders = parts;
const preLoaders = [];
const normalLoaders = [];
const postLoaders = [];

rules.forEach(rule => {
  if (rule.test.test(sourcePath)) {
    switch (rule.enforce) {
      case 'pre':
        preLoaders.push(...rule.use);
        break;
      case 'post':
        postLoaders.push(...rule.use);
        break;
      default:
        normalLoaders.push(...rule.use);
    }
  }
});

/**
 * @description: 根据 inlineLoader 规则过滤 loader
 * ！：单个 ! 开头, 排除所有 normal-loader
 * !!: 两个 !! 开头, 排除所有 pre-loader、normal-loader、post-loader
 * -!: 一个 -! 开头, 排除所有 pre-loader、normal-loader
 */

let loaders = [];

if (request.startsWith('!!')) {
  loaders.push(...inlineLoaders);
} else if (request.startsWith('-!')) {
  loaders.push(...postLoaders, ...inlineLoaders);
} else if (request.startsWith('!')) {
  loaders.push(...postLoaders, ...inlineLoaders, ...preLoaders);
} else {
  loaders.push(
    ...postLoaders,
    ...inlineLoaders,
    ...normalLoaders,
    ...preLoaders
  );
}

const resolveLoader = loader => {
  return Path.resolve(__dirname, './loaders', loader);
};

loaders = loaders.map(resolveLoader);

runLoaders(
  {
    resource: filePath,
    loaders,
    context: { name: 'bolawen' },
    readResource: Fs.readFile.bind(Fs)
  },
  (error, result) => {
    console.log('result', result);
  }
);
