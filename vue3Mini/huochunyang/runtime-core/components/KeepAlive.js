const KeepAlive = {
  // isKeepAlive: KeepAlive 组件独有属性，用作标识
  __isKeepAlive: true,
  props: {
    include: RegExp,
    exclude: RegExp
  },
  setup(props, setupContext) {
    const { slots } = setupContext;
    // cache: 缓存对象 key: vnode.type  value: vnode
    const cache = new Map();
    const instance = currentInstance;
    const { move, createElement } = instance.keepAliveCtx;
    // 创建隐藏容器
    const storageContainer = createElement('div');
    instance._deActive = vnode => {
      move(vnode, storageContainer);
    };
    instance._activate = (vnode, container, anchor) => {
      move(vnode, container, anchor);
    };

    return () => {
      // rawVNode: KeepAlive 中的默认插槽
      let rawVNode = slots.default();
      if (typeof rawVNode.type !== 'object') {
        // 如果 rawVNode 不是组件, 直接渲染, 因为非组件的虚拟节点无法被 KeepAlive
        return rawVNode;
      }

      const name = rawVNode.type.name;
      if (
        name &&
        ((props.include && !props.include.test(name)) ||
          (props.exclude && props.exclude.test(name)))
      ) {
        return rawVNode;
      }

      const cachedVNode = cache.get(rawVNode.type);
      if (cachedVNode) {
        // 如果有缓存
        rawVNode.component = cachedVNode.component;
        // rawVNode.keptAlive: 标识, 标记为 true 时, 可以避免渲染器重新挂载
        rawVNode.keptAlive = true;
      } else {
        // 如果没有缓存
        cache.set(rawVNode.type, rawVNode);
      }

      // rawVNode.shouldKeepAlive : 标识, 标记为 true 时, 可以避免渲染器真的将组件卸载
      rawVNode.shouldKeepAlive = true;
      // 将 KeepAlive 组件实例添加到 VNode 上, 以便在渲染器中访问
      rawVNode.keepAliveInstance = instance;
      return rawVNode;
    };
  }
};
