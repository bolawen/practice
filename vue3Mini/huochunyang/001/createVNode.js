const ShapeFlags = {
  ELEMENT: 1,
  FUNCTIONAL_COMPONENT: 1 << 1,
  STATEFUL_COMPONENT: 1 << 2,
  TEXT_CHILDREN: 1 << 3,
  ARRAY_CHILDREN: 1 << 4,
  COMPONENT: (1 << 2) | (1 << 1)
};

function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}

function isString(value) {
  return typeof value === 'string';
}

function isObject(value) {
  return typeof value === 'object' && value != null;
}

function isFunction(value) {
  return typeof value === 'function';
}

function normilizeKey(props) {
  return props.key != null ? key : null;
}

function createBaseVNode(type, props, children, shapeFlag) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    el: null,
    shapeFlag,
    anchor: null,
    target: null,
    component: null,
    key: props & normilizeKey(props)
  };

  return vnode;
}

function createVNode(type, props, children) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT
    : 0;
  return createBaseVNode(type, props, children, shapeFlag);
}

const vnode = createVNode('div', { class: 'text' }, '嘻嘻');
console.log(vnode);
