export function arrAdd(list, value) {
  const clone = (list || []).slice();
  if (clone.indexOf(value) === -1) {
    clone.push(value);
  }
  return clone;
}

export function arrDel(list, key) {
  if (!list) {
    return [];
  }
  const clone = list.slice();
  const index = clone.indexOf(key);
  if (index >= 0) {
    clone.splice(index, 1);
  }
  return clone;
}

export function getKey(key, pos) {
  if (key !== null || key !== undefined) {
    return key;
  }
  return pos;
}

export function getEntity(keyEntities, key) {
  return keyEntities[key];
}

export function getPosition(level, index) {
  return `${level}-${index}`;
}

export function fillFieldNames(fieldNames) {
  const { key, title, children } = fieldNames || {};

  return {
    key: key || 'key',
    title: title || 'title',
    children: children || 'children'
  };
}

export function initDefaultProps(types, defaultProps) {
  const propTypes = { ...types };
  Object.keys(defaultProps).forEach(k => {
    const prop = propTypes[k];
    if (prop) {
      if (prop.type || prop.default) {
        prop.default = defaultProps[k];
      } else if (prop.def) {
        prop.def(defaultProps[k]);
      } else {
        propTypes[k] = { type: prop, default: defaultProps[k] };
      }
    }
  });
  return propTypes;
}

function traverseDataNodes(treeData, callback, config) {
  let mergedConfig = {};
  if (typeof config === 'object') {
    mergedConfig = config;
  }

  const { fieldNames, childrenPropName } = mergedConfig;
  const { key: fieldKey, children: fieldChildren } = fillFieldNames(fieldNames);
  const mergedChildrenPropName = childrenPropName || fieldChildren;

  const processNode = (node, index, parent, pathNodes) => {
    const connectNodes = node ? [...pathNodes, node] : [];
    const pos = node ? getPosition(parent.pos, index) : '0';
    const mergedKey = node ? getKey(node[fieldKey], pos) : '0';
    const children = node ? node[mergedChildrenPropName] : treeData;

    if (node) {
      const data = {
        node,
        index,
        pos,
        key: mergedKey,
        nodes: connectNodes,
        level: parent.level + 1,
        parentPos: parent.node ? parent.pos : null
      };

      callback(data);
    }

    if (children) {
      children.forEach((subNode, subIndex) => {
        processNode(
          subNode,
          subIndex,
          { pos, node, level: parent ? parent.level + 1 : -1 },
          connectNodes
        );
      });
    }
  };

  processNode(null);
}

export function convertDataToEntities(
  dataNodes,
  { fieldNames, childrenPropName }
) {
  const posEntities = {};
  const keyEntities = {};
  const wrapper = { posEntities, keyEntities };

  traverseDataNodes(
    dataNodes,
    item => {
      const { node, index, pos, key, parentPos, level, nodes } = item;
      const entity = {
        node,
        nodes,
        index,
        key,
        pos,
        level
      };

      posEntities[pos] = entity;
      keyEntities[key] = entity;
      entity.parent = posEntities[parentPos];

      if (entity.parent) {
        entity.parent.children = entity.parent.children || [];
        entity.parent.children.push(entity);
      }
    },
    { fieldNames, childrenPropName }
  );

  return wrapper;
}

export function flattenTreeData(treeNodeList, expandedKeys, fieldNames) {
  const {
    key: fieldKey,
    title: fieldTitle,
    children: fieldChildren
  } = fillFieldNames(fieldNames);

  const flattenList = [];
  const expandedKeySet = new Set(expandedKeys === true ? [] : expandedKeys);

  const recursion = (list, parent = null) => {
    return list.map((treeNode, index) => {
      const pos = getPosition(treeNode[fieldKey], index);
      const mergedKey = getKey(treeNode[fieldKey], pos);

      const flattenNode = {
        pos,
        parent,
        data: treeNode,
        key: mergedKey,
        children: null,
        title: treeNode[fieldTitle],
        isStart: [...(parent ? parent.isStart : []), index === 0],
        isEnd: [...(parent ? parent.isEnd : []), index === list.length - 1]
      };

      flattenList.push(flattenNode);

      if (expandedKeys === true || expandedKeySet.has(mergedKey)) {
        flattenNode[fieldChildren] = recursion(
          treeNode[fieldChildren] || [],
          flattenNode
        );
      } else {
        flattenNode[fieldChildren] = [];
      }

      return flattenNode;
    });
  };

  recursion(treeNodeList);
  return flattenList;
}

export function getTreeNodeProps(key, { keyEntities, expandedKeys }) {
  const entity = getEntity(keyEntities, key);

  const treeNodeProps = {
    eventKey: key,
    level: entity ? entity.level : 0,
    pos: String(entity ? entity.pos : ''),
    expanded: expandedKeys.indexOf(key) !== -1
  };

  return treeNodeProps;
}

export function convertNodePropsToEventData(props) {
  const { pos, active, eventKey, data, expanded, selected, checked } = props;
  const eventData = {
    ...data,
    pos,
    data,
    active,
    eventKey,
    checked,
    expanded,
    selected
  };
  return eventData;
}
