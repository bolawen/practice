import TreeNode from './TreeNode';
import { defineComponent } from 'vue';
import { useInjectKeysState } from './contextTree';
import { getKey, getTreeNodeProps } from './treeUtil';

const nodeListProps = {};

export default defineComponent({
  name: 'NodeList',
  props: nodeListProps,
  setup() {
    const { flattenNodes, expandedKeys, keyEntities } = useInjectKeysState();

    return () => {
      return (
        <div class="tree-node-list">
          {flattenNodes.value.map(treeNode => {
            const { key, pos } = treeNode;
            const mergedKey = getKey(key, pos);
            const treeNodeProps = getTreeNodeProps(mergedKey, {
              keyEntities: keyEntities.value,
              expandedKeys: expandedKeys.value
            });

            return <TreeNode key={key} {...treeNode} {...treeNodeProps} />;
          })}
        </div>
      );
    };
  }
});
