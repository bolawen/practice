const treeNode = {
  id: 2,
  pid: 0,
  children: [
    {
      id: 21,
      pid: 2,
      children: [
        {
          id: 211,
          pid: 21,
        },
        {
          id: 212,
          pid: 21,
          children: [
            {
              id: 2121,
              pid: 212,
            },
            {
              id: 2122,
              pid: 212,
            },
          ],
        },
      ],
    },
    {
      id: 22,
      pid: 2,
      children: [
        {
          id: 221,
          pid: 22,
        },
        {
          id: 222,
          pid: 22,
        },
      ],
    },
  ],
};

function findTreeDepth(treeNode) {
  let maxDepth = 0;
  let maxDepthElement = null;

  function traverse(node, depth) {
    if (depth > maxDepth) {
      maxDepth = depth;
      maxDepthElement = node;
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(treeNode, 1);
  return { maxDepth, maxDepthElement };
}

const result = findTreeDepth(treeNode);
console.log("Max Depth:", result.maxDepth);
console.log("Max Depth Element:", result.maxDepthElement);
