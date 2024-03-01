import TreeNode from './treeNode';
import { getKey, getTreeNodeProps } from './treeUtil';

function NodeList(props) {
  const { data, keyEntities, expandedKeys, onNodeExpand } = props;

  return (
    <div className={`tree-node-list`}>
      {data.map(treeNode => {
        const { key, pos } = treeNode;
        const mergedKey = getKey(key, pos);
        const treeNodeProps = getTreeNodeProps(mergedKey, {
          keyEntities,
          expandedKeys
        });

        return (
          <TreeNode
            key={key}
            {...treeNode}
            {...treeNodeProps}
            keyEntities={keyEntities}
            onNodeExpand={onNodeExpand}
          />
        );
      })}
    </div>
  );
}

export default NodeList;
