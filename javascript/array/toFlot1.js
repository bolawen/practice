function flattenTree(tree, path = '') {
    const flattenedTree = [];

    for (const node of tree) {
        const { id, pid, children } = node;
        const nodePath = path ? `${path}.${id}` : `${id}`;

        flattenedTree.push({ ...node, path: nodePath });

        if (children) {
            flattenedTree.push(...flattenTree(children, nodePath));
        }
    }

    return flattenedTree;
}

const flattenedTree = flattenTree(tree);
console.log(flattenedTree);