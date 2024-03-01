import './tree.scss';
import NodeList from './NodeList';
import { TreeProps } from './treeProps';
import { useProvideKeysState } from './contextTree';
import {
  fillFieldNames,
  flattenTreeData,
  initDefaultProps,
  convertDataToEntities,
  arrAdd,
  arrDel
} from './treeUtil';
import {
  watch,
  toRaw,
  computed,
  watchEffect,
  shallowRef,
  defineComponent
} from 'vue';

export default defineComponent({
  name: 'Tree',
  props: initDefaultProps(TreeProps(), {
    treeData: [],
    children: [],
    fieldNames: { key: 'key', title: 'title', children: 'children' }
  }),
  setup(props) {
    const treeData = shallowRef([]);
    const keyEntities = shallowRef({});
    const flattenNodes = shallowRef([]);
    const expandedKeys = shallowRef([]);

    const fieldNames = computed(() => fillFieldNames(props.fieldNames));

    const setExpandedKeys = newExpandedKeys => {
      expandedKeys.value = newExpandedKeys;
    };

    const onNodeExpand = (e, treeNode) => {
      const { expanded } = treeNode;
      const key = treeNode[fieldNames.value.key];
      const targetExpanded = !expanded;

      if (targetExpanded) {
        setExpandedKeys(arrAdd(expandedKeys.value, key));
      } else {
        setExpandedKeys(arrDel(expandedKeys.value, key));
      }
    };

    watch(
      () => props.treeData,
      () => {
        treeData.value = toRaw(props.treeData);
      },
      {
        deep: true,
        immediate: true
      }
    );

    watchEffect(() => {
      if (treeData.value) {
        const entitiesMap = convertDataToEntities(treeData.value, {
          fieldNames: fieldNames.value
        });
        keyEntities.value = entitiesMap.keyEntities;
      }
    });

    watchEffect(() => {
      flattenNodes.value = flattenTreeData(
        treeData.value,
        expandedKeys.value,
        fieldNames.value
      );
    });

    useProvideKeysState({
      expandedKeys,
      flattenNodes,
      keyEntities,
      onNodeExpand
    });

    return () => {
      return (
        <div class="tree">
          <NodeList />
        </div>
      );
    };
  }
});
