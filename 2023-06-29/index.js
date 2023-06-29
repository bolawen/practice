function deepClone(origin, map) {
  if (typeof origin !== "object") {
    return origin;
  }
  map = map || new Map();
  if (map.has(origin)) {
    return map.get(origin);
  }
  const target = Array.isArray(origin) ? [] : {};
  map.set(origin, target);
  for (let key in origin) {
    target[key] = deepClone(origin[key], map);
  }
  return target;
}

const object = {
  id: 3,
  like: {
    ball: "篮球",
  },
  love: ["唱歌", "跳舞", "rap"],
};
object.object = object;

const objectCopy = deepClone(object);

objectCopy.object.love[0] = "唱歌修改";

console.log(object);
console.log(objectCopy);
console.log(object === objectCopy); // false
console.log(object.object === objectCopy.object); // false
