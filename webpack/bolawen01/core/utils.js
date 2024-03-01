const Fs = require('fs');

/**
 * @description: toUnixPath 统一路径分隔符为 /
 * @param {*} path
 * 作用: 因为不同操作系统下，文件分隔路径是不同的。这里我们统一使用 / 来替换路径中的 \\。后续我们会使用模块相对于rootPath的路径作为每一个文件的唯一ID，所以这里统一处理下路径分隔符。
 */
function toUnixPath(path) {
  return path.replace(/\\/g, '/');
}

/**
 * @description: tryExtensions 按照传入的规则为文件添加后缀
 * @param {*} modulePath
 * @param {*} extensions
 * @param {*} originModulePath
 * @param {*} moduleContext
 */
function tryExtensions(
  modulePath,
  extensions,
  originModulePath,
  moduleContext
) {
  // 优先尝试不需要扩展名选项: 防止用户如果已经传入了后缀时，我们优先尝试直接寻找，如果可以找到文件那么就直接返回。找不到的情况下才会依次尝试。
  extensions.unshift('');
  for (let extension of extensions) {
    if (Fs.existsSync(modulePath + extension)) {
      return modulePath + extension;
    }
  }
  throw new Error(
    `No module, Error: Can't resolve ${originModulePath} in  ${moduleContext}`
  );
}

/**
 * @description: getSourceCode 接收传入的 chunk 对象，从而返回该 chunk 的源代码。
 * @param {*} chunk
 */
function getSourceCode(chunk) {
  const { name, entryModule, modules } = chunk;
  return `
        (()=>{
            var __webpack_modules__ = {
                ${modules
                  .map(module => {
                    return `'${module.id}': (module)=> {
                        ${module._source}
                    }`;
                  })
                  .join(',')}
            };

            // The module cache
            var __webpack_module_cache__ = {};

            // The require function
            function __webpack_require__(moduleId){
                var cachedModule = __webpack_module_cache__[moduleId];
                if(cachedModule !== undefined){
                    return cachedModule.exports;
                }
                var module = (__webpack_module_cache__[moduleId] = {
                    exports: {}
                })
                __webpack_modules__[moduleId](module,module.exports, __webpack_require__);
                return module.exports;
            }

            var __webpack_exports__ = {};

            (()=>{
                ${entryModule._source}
            })()
        })();
    `;
}

module.exports = {
  toUnixPath,
  tryExtensions,
  getSourceCode
};
