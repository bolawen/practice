import { NodeTypes } from '../ast.js';

export const transformText = (node, context) => {
  if (node.type === NodeTypes.Root || node.type === NodeTypes.Element) {
    return () => {
      console.log('处理 Text 节点');
    };
  }
};
