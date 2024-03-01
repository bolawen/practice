import Indent from './Indent';
import { TreeNodeProps } from './treeProps';
import { computed, defineComponent } from 'vue';
import { useInjectKeysState } from './contextTree';
import { convertNodePropsToEventData, getEntity } from './treeUtil';

export default defineComponent({
  name: 'TreeNode',
  props: TreeNodeProps(),
  setup(props) {
    const { isEnd, level, title, isStart, eventKey, expanded } = props;
    const { keyEntities, onNodeExpand } = useInjectKeysState();
    const { children } = getEntity(keyEntities.value, eventKey) || {};

    const eventData = computed(() => convertNodePropsToEventData(props));
    const hasChildren = computed(() => !!(children || []).length);
    const isLeaf = computed(() => !hasChildren.value);

    const onExpand = e => {
      onNodeExpand(e, eventData.value);
    };

    const renderSwitcher = () => {
      if (isLeaf.value) {
        return <span className={`switcher switcher-noop`}></span>;
      }

      const switcherIconDom = expanded ? '-' : '+';

      return (
        <span
          className={`switcher switcher-${expanded ? 'open' : 'close'}`}
          onClick={onExpand}
        >
          {switcherIconDom}
        </span>
      );
    };

    const renderCheckbox = () => {
      return null;
    };

    const renderSelector = () => {
      return title;
    };

    return () => {
      return (
        <div class="tree-node">
          <Indent isEnd={isEnd} level={level} isStart={isStart} />
          {renderSwitcher()}
          {renderCheckbox()}
          {renderSelector()}
        </div>
      );
    };
  }
});
