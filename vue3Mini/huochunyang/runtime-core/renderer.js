import { effect } from '../reactivity/effect';
import {
  reactive,
  shallowReactive,
  shallowReadonly
} from '../reactivity/reactive';
import { queueJob } from '../reactivity/scheduler';
import { isSameVNodeType } from './vnode';
import { resolveProps } from './componentProps';
import { hasPropsChanged } from './componentRenderUtils';

export const Text = Symbol('v-text');
export const Comment = Symbol('v-comment');
export const Static = Symbol('v-static');
export const Fragment = Symbol('v-fragment');
export const EMPTY_ARR = [];

let currentInstance = null;
const STATEFUL_COMPONENT = 1 << 2;
const FUNCTIONAL_COMPONENT = 1 << 1;

const ShapeFlags = {
  ELEMENT: 1,
  FUNCTIONAL_COMPONENT,
  STATEFUL_COMPONENT,
  TEXT_CHILDREN: 1 << 3,
  ARRAY_CHILDREN: 1 << 4,
  SLOTS_CHILDREN: 1 << 5,
  TELEPORT: 1 << 6,
  SUSPENSE: 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE: 1 << 8,
  COMPONENT_KEPT_ALIVE: 1 << 9,
  COMPONENT: STATEFUL_COMPONENT | FUNCTIONAL_COMPONENT
};

function setCurrentInstance(instance) {
  currentInstance = instance;
}

export function onMounted(fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn);
  } else {
    console.log('onMounted 函数只能在 setup 中调用');
  }
}

export function createRenderer(options) {
  const {
    insert: hostInsert,
    setText: hostSetText,
    patchProp: hostPatchProp,
    createText: hostCreateText,
    createComment: hostCreateComment,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options;

  const patch = (n1, n2, container, anchor) => {
    if (n1 === n2) {
      return;
    }

    if (n1 && n1.type !== n2.type) {
      /**
       * @description: 如果新旧 vnode 类型不同, 直接将旧 vnode 卸载
       * 描述: 对于 type 不同的元素来说, 每个元素都有特有的属性, 不存在打补丁的意义。在 type 不同的情况下, 先将旧 vnode 卸载, 再将新 vnode 挂载到容器中
       */
      unmount(n1);
      n1 = null;
    }

    const { type, shapeFlag } = n2;

    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
        } else if (shapeFlag & ShapeFlags.SUSPENSE) {
        }
    }
  };

  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      const el = (n2.el = hostCreateText(n2.children));
      hostInsert(el, container, anchor);
    } else {
      const el = (n2.el = n1.el);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };

  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      const el = (n2.el = hostCreateComment(n2.children));
      hostInsert(el, container, anchor);
    } else {
      n2.el = n1.el;
    }
  };

  const processFragment = (n1, n2, container, anchor) => {
    if (!n1) {
      n2.children.forEach(c => patch(null, c, container, anchor));
    } else {
      patchChildren(n1, n2, container, anchor);
    }
  };

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  };

  const mountElement = (vnode, container, anchor) => {
    // vnode 与 node 之间建立联系, 后续可以通过 vnode.el 获取真实 DOM
    const el = (vnode.el = hostCreateElement(vnode.type));

    if (typeof vnode.children === 'string') {
      hostSetElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        /**
         * @description: patch 挂载点需要更改为当前 vnode 创建的 DOM 元素 el， 保证 child 子节点挂载到正确的位置
         */
        patch(null, child, el);
      });
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        hostPatchProp(el, key, null, vnode.props[key]);
      }
    }

    hostInsert(el, container, anchor);
  };

  const patchElement = (n1, n2) => {
    const el = (n2.el = n1.el);
    const oldProps = n1.props;
    const newProps = n2.props;

    /**
     * @description: 更新 children
     */
    patchChildren(n1, n2, el, null);

    /**
     * @description: 更新 Props
     */
    patchProps(el, n2, oldProps, newProps);
  };

  const processComponent = (n1, n2, container, anchor) => {
    if (n1 == null) {
      if (n2.keptAlive) {
        n2.keepAliveInstance._activate(n2, container, anchor);
      } else {
        mountComponent(n2, container, anchor);
      }
    } else {
      updateComponent(n1, n2, container, anchor);
    }
  };

  const mountComponent = (vnode, container, anchor) => {
    const componentOptions = vnode.type;
    let {
      data,
      setup,
      props: propsOption,
      render,
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated
    } = componentOptions;

    beforeCreate && beforeCreate();

    const slots = vnode.children || [];
    const state = data ? reactive(data()) : null;
    const [props, attrs] = resolveProps(propsOption, vnode.props);

    /**
     * @description: 组件实例
     */
    const instance = {
      state,
      attrs,
      slots,
      mounted: [],
      subTree: null,
      isMounted: false,
      keepAliveCtx: null,
      props: shallowReactive(props)
    };

    const isKeepAlive = vnode.type.__isKeepAlive;

    if (isKeepAlive) {
      instance.keepAliveCtx = {
        move(vnode, container, anchor) {
          insert(vnode.component.subTree.el, container, anchor);
        },
        createElement
      };
    }

    function emit(event, ...payload) {
      const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
      const handler = instance.props[eventName];
      if (handler) {
        handler(...payload);
      } else {
        console.log(`${eventName} 事件不存在`);
      }
    }

    const setupContext = { emit, slots, attrs };
    setCurrentInstance(instance);

    const setupResult = setup(shallowReadonly(instance.props), setupContext);
    let setupState = null;
    if (typeof setupResult === 'function') {
      if (render) {
        console.log('setup 返回值为函数，将作为渲染函数， render 选项将被忽略');
      }
      render = setupResult;
    } else {
      setupState = setupResult;
    }
    vnode.component = instance;
    setCurrentInstance(null);

    const renderContext = new Proxy(instance, {
      get(target, key, receiver) {
        const { state, props } = target;
        if (state && key in state) {
          return Reflect.get(state, key, receiver);
        } else if (key in props) {
          return Reflect.get(props, key, receiver);
        } else if (setupState && key in setupState) {
          return Reflect.get(setupState, key, receiver);
        } else if (key === '$slots') {
          return slots;
        } else {
          console.error(`${key} 不存在`);
          return false;
        }
      },

      set(target, key, value, receiver) {
        const { state, props } = target;
        if (state && key in state) {
          return Reflect.set(state, key, value, receiver);
        } else if (key in props) {
          console.warn(`props 是只读的`);
          return false;
        } else if (key in setupState) {
          return Reflect.set(setupState, key, value, receiver);
        } else {
          console.error(`${key} 不存在`);
          return false;
        }
      }
    });

    created && created.call(renderContext);

    effect(
      () => {
        const subTree = render.call(renderContext, renderContext);
        if (!instance.isMounted) {
          beforeMount && beforeMount.call(renderContext);
          patch(null, subTree, container, anchor);
          instance.isMounted = true;

          instance.mounted &&
            instance.mounted.forEach(hook => hook.call(renderContext));
        } else {
          beforeUpdate && beforeUpdate.call(renderContext);
          patch(instance.subTree, subTree, container, anchor);
          updated && updated.call(renderContext);
        }
        instance.subTree = subTree;
      },
      {
        scheduler: queueJob
      }
    );
  };

  const updateComponent = (n1, n2, container) => {
    const instance = (n2.component = n1.component);
    const { props } = instance;

    if (hasPropsChanged(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props);
      for (const k in nextProps) {
        props[k] = nextProps[k];
      }
      for (const k in props) {
        if (!(k in nextProps)) {
          delete props[k];
        }
      }
    }
  };

  const patchChildren = (n1, n2, container, anchor) => {
    const c1 = n1 && n1.children;
    const c2 = n2.children;

    if (typeof c2 === 'string') {
      /**
       * @description: 分支一: 如果新子节点为字符串
       * 旧子节点没有子节点:   不做事情
       * 旧子节点为文本节点:   不做事情
       * 旧子节点为数组: 逐个卸载
       */
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }
      hostSetElementText(container, c2);
    } else if (Array.isArray(c2)) {
      /**
       * @description: 分支二: 如果新子节点为数组
       * 旧子节点没有子节点:   清空容器
       * 旧子节点为文本节点:   清空容器
       * 旧子节点为数组: Diff 算法
       */
      if (Array.isArray(n1.children)) {
        /**
         * @description: 新子节点为数组, 旧子节点为数组, 进行 Diff 算法
         */
        patchKeyedChildren(c1, c2, container, anchor);
      } else {
        /**
         * @description: 新子节点为数组, 旧子节点为单个节点, 将容器元素清空, 将新子节点数组逐个挂载到容器中
         */
        hostSetElementText(container, '');
        c2.forEach(c => patch(null, c, container));
      }
    } else {
      /**
       * @description: 分支三: 如果新子节点为空
       * 旧子节点没有子节点:   不做事情
       * 旧子节点为文本节点:   清空容器
       * 旧子节点为数组: 逐个卸载
       */
      if (Array.isArray(c1)) {
        c.forEach(c => unmount(c));
      } else if (typeof c1 === 'string') {
        hostSetElementText(container, '');
      }
    }
  };

  const patchKeyedChildren = (c1, c2, container, parentAnchor) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null);
      } else {
        break;
      }
      i++;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(null, c2[i], container, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;

      const keyToNewIndexMap = new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }

      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (
              newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j])
            ) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          unmount(prevChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(prevChild, c2[newIndex], container, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild);
          } else {
            j--;
          }
        }
      }
    }
  };

  const patchProps = (el, vnode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      for (const key in oldProps) {
        if (!key in newProps) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
    for (const key in newProps) {
      if (newProps[key] != oldProps[key]) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
    }
  };

  const move = (vnode, container, anchor) => {
    const { el } = vnode;
    hostInsert(el, container, anchor);
  };

  const unmount = vnode => {
    if (vnode.type === Fragment) {
      vnode.children.forEach(c => unmount(c));
      return;
    } else if (typeof vnode.type === 'object') {
      if (vnode.shouldKeepAlive) {
        vnode.keepAliveInstance._deActivate(vnode);
      } else {
        unmount(vnode.component.subTree);
      }
      return;
    }

    const parent = vnode.el.parentNode;
    if (parent) {
      parent.removeChild(vnode.el);
    }
  };

  const render = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        /**
         * @description: 新 vnode 不存在 且 旧 vnode 存在, 说明是 卸载 unmount 操作, 直接通过 innerHTML 清空容器
         */
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode, vnode, container);
    }

    container._vnode = vnode;
  };

  return {
    render
  };
}

function getSequence(nums) {
  let len = 1;
  const { length } = nums;
  const d = new Array(nums.length + 1);
  d[len] = 0;
  for (let i = 1; i < length; i++) {
    const num = nums[i];
    if (nums[d[len]] < num) {
      d[++len] = i;
    } else {
      let left = 1;
      let right = len;
      let pos = 0;
      while (left <= right) {
        let middle = (left + right) >> 1;
        if (nums[d[middle]] < num) {
          pos = middle;
          left = middle + 1;
        } else {
          right = middle - 1;
        }
      }
      d[pos + 1] = i;
    }
  }
  return d.filter(i => i != null);
}
