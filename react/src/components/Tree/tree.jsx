import './tree.scss';
import NodeList from './nodeList';
import { useEffect, useState } from 'react';
import {
  arrAdd,
  arrDel,
  flattenTreeData,
  convertDataToEntities
} from './treeUtil';

function Tree(props) {
  const {
    treeData,
    fieldNames = { key: 'key', title: 'title', children: 'children' }
  } = props;

  const [keyEntities, setKeyEntities] = useState({});
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [flattenNodes, setFlattenNodes] = useState([]);

  const setExpandedKeysAndFlattenNodes = expandedKeys => {
    const flattenNodes = flattenTreeData(treeData, expandedKeys, fieldNames);

    setExpandedKeys(expandedKeys);
    setFlattenNodes(flattenNodes);
  };

  const onNodeExpand = (e, treeNode) => {
    const { expanded } = treeNode;
    const key = treeNode[fieldNames.key];
    const targetExpanded = !expanded;

    if (targetExpanded) {
      setExpandedKeysAndFlattenNodes(arrAdd(expandedKeys, key));
    } else {
      setExpandedKeysAndFlattenNodes(arrDel(expandedKeys, key));
    }
  };

  const initExpandedKeys = () => {
    let expandedKeys = [];
    setExpandedKeys(expandedKeys);
    return expandedKeys;
  };

  const initKeyEntities = () => {
    const entitiesMap = convertDataToEntities(treeData, { fieldNames });
    setKeyEntities(entitiesMap.keyEntities);
    return entitiesMap.keyEntities;
  };

  const initFlattenNodes = expandedKeys => {
    const flattenNodes = flattenTreeData(
      treeData,
      expandedKeys,
      fieldNames || {}
    );
    setFlattenNodes(flattenNodes);
  };

  const initData = () => {
    const keyEntities = initKeyEntities();
    const expandedKeys = initExpandedKeys(keyEntities);
    initFlattenNodes(expandedKeys);
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div className={`tree`}>
      <NodeList
        data={flattenNodes}
        keyEntities={keyEntities}
        expandedKeys={expandedKeys}
        onNodeExpand={onNodeExpand}
      />
    </div>
  );
}

export default Tree;
