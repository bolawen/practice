let noType = 0b0000;
let typeA = 0b0001;
let typeB = 0b0010;
let typeC = 0b0100;

function mergeType(typeA, typeB) {
  return typeA | typeB;
}

function removeType(typeA, typeB) {
  return typeA & ~typeB;
}

function hasType(typeA, typeB) {
  return (typeA & typeB) === typeB;
}

function getHighestPriorityType(typeA) {
  return typeA & -typeA;
}

const typeAB = mergeType(typeA, typeB);
let typeABC = mergeType(typeAB, typeC);

console.log('typeABC 中是否包含 typeB', hasType(typeABC, typeB));
typeABC = removeType(typeABC, typeB);
console.log('typeABC 中移除 typeB 后是否包含 typeB', hasType(typeABC, typeB));
console.log(
  'typeABC 中最高优先级的 type (二进制表示))',
  getHighestPriorityType(typeABC).toString(2)
);
console.log(
  'typeABC 中最低优先级的 type (二进制表示)',
  getLowestPriorityType(typeABC).toString(2)
);
