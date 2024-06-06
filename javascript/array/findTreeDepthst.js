
function findTreeDepth(tree) {
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

    for (const node of tree) {
        traverse(node, 1);
    }

    return { maxDepth, maxDepthElement };
}

const result = findTreeDepth(tree);
console.log('Max Depth:', result.maxDepth);
console.log('Max Depth Element:', result.maxDepthElement);