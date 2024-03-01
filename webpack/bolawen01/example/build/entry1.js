(() => {
  var __webpack_modules__ = {
    './example/src/a.js': module => {
      const a = 1;
      const b = 2;
      module.exports = {
        a,
        b
      };

      // loader1 处理
      // loader1 处理
    }
  };

  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {}
    });
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }

  var __webpack_exports__ = {};

  (() => {
    const { a, b } = __webpack_require__('./example/src/a.js');
    console.log('a', a);
    console.log('b', b);

    // loader1 处理
    // loader1 处理
  })();
})();
