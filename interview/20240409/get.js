function get(object, path, defaultValue) {
  const splitReg = /[,\[\].?]+?/;
  const normalizedPaths = String.prototype.split
    .call(path, splitReg)
    .filter(Boolean);
  console.log("normalizedPaths", normalizedPaths);
}

const obj = {
  a: 1,
  b: {
    c: {
      d: [1, 2, 3],
    },
  },
};

console.log(get(obj, ["b", "c", "d[1]"]));
console.log(get(obj, "b.c.d[1]"));
