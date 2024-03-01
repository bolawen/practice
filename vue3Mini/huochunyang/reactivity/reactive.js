import { isObject, toRawType } from '../util';
import { mutableHandlers } from './baseHandlers';
import { mutableCollectionHandlers } from './collectionHandlers';

/**
 * @description: 定义一个 Map 实例, 存储原始对象到代理对象的映射
 */
export const reactiveMap = new WeakMap();
export const TargetType = {
  invalid: 0,
  common: 1,
  collection: 2
};
export const ReactiveFlags = {
  RAW: '__v_raw',
  IS_SHALLOW: '__v_isShallow',
  IS_READONLY: '__v_isReadonly',
  IS_REACTIVE: '__v_isReactive'
};

function targetTypeMap(rawType) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.common;
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.collection;
    default:
      return TargetType.invalid;
  }
}

function getTargetType(value) {
  return targetTypeMap(toRawType(value));
}

function createReactiveObject(
  target,
  baseHandlers,
  collectionHandlers,
  proxyMap
) {
  if (!isObject(target)) {
    return target;
  }

  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  const targetType = getTargetType(target);
  if (targetType.invalid) {
    return target;
  }

  /**
   * @description: 每次调用 reactive 函数创建代理对象之前, 优先检查是否已经存在相应的代理对象, 如果存在, 则直接返回已有的代理对象, 这样就避免了同一个原始对象多次创建代理对象的问题。
   */

  const proxy = new Proxy(
    target,
    targetType === TargetType.common ? baseHandlers : collectionHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(
    target,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}

export function shallowReactive(target) {
  return createReactiveObject(
    target,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}

export function readonly(target) {
  return createReactiveObject(
    target,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}

export function shallowReadonly(target) {
  return createReactiveObject(
    target,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}

export function toRaw(observed) {
  const raw = observed && observed[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed;
}
