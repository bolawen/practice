Function.prototype.bind = function (context, ...argsOut) {
  const fn = this;

  if (context) {
    context = Object(context);
  } else {
    context = typeof window == "undefined" ? global : window;
  }

  return function (...argsIn) {
    context.__fn__ = fn;
    const finalArgs = [...argsOut, ...argsIn];
    const result = context.__fn__(...finalArgs);
    delete context.__fn__;
    return result;
  };
};

function foo(name, age, ...args) {
  console.log(this);
  console.log(name, age);
  console.log(args);
}
const obj = {
  name: "柏拉图",
  age: 23,
};
const fooBind = foo.bind(obj, "哈哈哈", 32);
fooBind("嘻嘻嘻", 250);
