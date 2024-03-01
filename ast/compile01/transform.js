import { NodeTypes } from './ast.js';

function createTransformContext(root, { nodeTransforms = [] }) {
  const context = {
    root,
    parent: null,
    nodeTransforms,
    childIndex: 0,
    currentNode: root,
    replaceNode(node) {
      context.parent.children[context.childIndex] = context.currentNode = node;
    }
  };

  return context;
}

function traverseChildren(parent, context) {
  let i = 0;
  for (; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (typeof child === 'string') {
      continue;
    }
    context.parent = parent;
    context.childIndex = i;
    traverseNode(child, context);
  }
}

function traverseNode(node, context) {
  context.currentNode = node;
  const { nodeTransforms } = context;
  const exitFns = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context);
    if (onExit) {
      if (Array.isArray(onExit)) {
        exitFns.push(...onExit);
      } else {
        exitFns.push(onExit);
      }
    }

    if (!context.currentNode) {
      return;
    } else {
      node = context.currentNode;
    }
  }

  switch (node.type) {
    case NodeTypes.Root:
    case NodeTypes.Element:
      traverseChildren(node, context);
      break;
  }

  context.currentNode = node;
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

export function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  return root;
}
