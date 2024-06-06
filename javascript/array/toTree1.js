function toTree(array) {
    const map = {};
    const result = [];

    // Create a map of nodes using their id as the key
    array.forEach(node => {
        map[node.id] = { ...node, children: [] };
    });

    // Iterate over the array and add each node to its parent's children array
    array.forEach(node => {
        if (node.pid === 0) {
            result.push(map[node.id]);
        } else {
            map[node.pid].children.push(map[node.id]);
        }
    });

    return result;
}

const tree = toTree(array);
console.log(tree);