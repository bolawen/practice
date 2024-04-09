function get(obj, path, defaultValue = undefined) {
  const regExp = /[,[\].?]+?/;
  const pathKeyList = String.prototype.split.call(path, regExp).filter(Boolean);
  for (let key of pathKeyList) {
    if (!obj) {
      return defaultValue;
    }
    obj = obj[key];
  }
  return obj;
}

const obj = {
  a: 1,
  b: {
    c: {
      d: [1, 2, 3],
    },
  },
};

console.log("obj 数组", get(obj, ["b", "c", "d[1]"]));
console.log("obj 字符串", get(obj, "b.c.d[1]"));

const obj1 = { a: [{ b: { c: 3 } }] };
console.log("obj1 数组", get(obj1, ["a", "0", "b", "c"], 1));
console.log("obj1 数组", get(obj1, ["a[0]", "b", "c"], 1));
console.log("obj1 字符串", get(obj1, "a[0],b.c", 1));

const reg = /[,\[\].?]+?/;
console.log(reg.exec("a[0].b.c"));

console.log("a[0].b.c".split(reg));
