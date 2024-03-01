import './tree.scss';
import Indent from './indent';
import { getEntity, convertNodePropsToEventData } from "./treeUtil"

function TreeNode(props) {
  const {
    isEnd,
    title,
    level,
    isStart,
    eventKey,
    expanded,
    prefixCls,
    keyEntities,
    onNodeExpand
  } = props;

  const { children } = getEntity(keyEntities, eventKey) || {};

  const onExpand = (e)=>{
    onNodeExpand(e,convertNodePropsToEventData(props));
  }

  const isHasChildren = () => {
    return !!(children || []).length;
  };

  const isLeafFun = () => {
    const hasChildren = isHasChildren();
    return !hasChildren;
  };

  const renderSwitcher = () => {
    if (isLeafFun()) {
      return (
        <span
          className={`switcher switcher-noop`}
        ></span>
      );
    }

    const switcherIconDom = expanded ? '-' : '+';

    return (
      <span
        className={`switcher switcher-${
          expanded ? 'open' : 'close'
        }`}
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

  return (
    <div className={`tree-node`}>
      <Indent
        isEnd={isEnd}
        level={level}
        isStart={isStart}
        prefixCls={prefixCls}
      />
      {renderSwitcher()}
      {renderCheckbox()}
      {renderSelector()}
    </div>
  );
}

export default TreeNode;
