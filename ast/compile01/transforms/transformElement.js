import { NodeTypes } from '../ast.js';

export const transformElement = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode;

    if (node.type !== NodeTypes.Element) {
      return;
    }

    const { tag, props } = node;
    console.log('处理 Element 节点');
  };
};
