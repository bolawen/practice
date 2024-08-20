(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    define(["dependency"], factory);
  } else if (typeof module === "object" && module.exports) {
    // CommonJS
    module.exports = factory(require("dependency"));
  } else {
    // Browser (root is window)
    root.umdModule = factory(root.dependency);
  }
})(this, function (dependency) {
  return {
    foo: function () {
      console.log("foo 函数");
    },
  };
});
