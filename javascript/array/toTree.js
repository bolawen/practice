const array = [
  { id: 1, pid: 0, path: "1" },
  { id: 11, pid: 1, path: "1,11" },
  { id: 111, pid: 11, path: "1,11,111" },
  { id: 112, pid: 11, path: "1,11,112" },
  { id: 12, pid: 1, path: "1,12" },
  { id: 121, pid: 12, path: "1,12,121" },
  { id: 122, pid: 12, path: "1,12,122" },
  { id: 2, pid: 0, path: "2" },
  { id: 21, pid: 2, path: "2,21" },
  { id: 211, pid: 21, path: "2,21,211" },
  { id: 212, pid: 21, path: "2,21,212" },
  { id: 2121, pid: 212, path: "2,21,212,2121" },
  { id: 2122, pid: 212, path: "2,21,212,2122" },
  { id: 22, pid: 2, path: "2,22" },
  { id: 221, pid: 22, path: "2,22,221" },
  { id: 222, pid: 22, path: "2,22,222" },
];

function toTree(array) {
  const map = {};
  const result = [];

  array.forEach((node) => {
    map[node.id] = { ...node, children: [] };
  });

  array.forEach((node) => {
    if (node.pid === 0) {
      result.push(map[node.id]);
    } else {
      map[node.pid].children.push(map[node.id]);
    }
  });

  return result;
}

const tree = toTree(array);
console.log("tree",tree);