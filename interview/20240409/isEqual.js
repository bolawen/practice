function isObject(value) {
  return typeof value === "object" && value != null;
}

function isEqual(value, other) {
  if (!isObject(value) || !isObject(other)) {
    return value === other;
  }

  const valueKeys = Object.keys(value);
  const otherKeys = Object.keys(value);

  if (valueKeys.length !== otherKeys.length) {
    return false;
  }

  for (let key in value) {
    if (!isEqual(value[key], other[key])) {
      return false;
    }
  }

  return true;
}

const value = { x: 1, y: 2, z: [{ x: 1, y: 2 }, 2, 3] };
const other = { y: 2, x: 1, z: [{ y: 2, x: 1 }, 2, 3] };
console.log(isEqual(value, other));

function isEqual(value, other) {
  if (!isObject(value) || !isObject(other)) {
    return value === other;
  }

  const valueKeys = Object.keys(value);
  const otherKeys = Object.keys(value);

  if (valueKeys.length !== otherKeys.length) {
    return false;
  }

  for (let key in value) {
    if (!isEqual(value[key], other[key])) {
      return false;
    }
  }

  return true;
}
