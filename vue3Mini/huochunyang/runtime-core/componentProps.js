export function resolveProps(options, propsData) {
  const props = {};
  const attrs = {};
  for (const key in propsData) {
    if (key in options || key.startsWith('on')) {
      // 如果 key 在 vnode.type.props 有定义，存储到 props 中
      props[key] = propsData[key];
    } else {
      // 如果 key 在 vnode.type.props 没有定义, 存储到 attrs 中
      attrs[key] = propsData[key];
    }
  }
  return [props, attrs];
}
