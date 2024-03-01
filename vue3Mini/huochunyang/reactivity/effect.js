import { isMap, isArray, isObject, isIntegerKey } from '../util';

/**
 * @description: 当前激活的副作用(effect)函数
 */
export let activeEffect;
/**
 * @description: 副作用(effect)函数栈
 * 作用: 在副作用执行时, 将当前副作用函数压入栈中,待副作用函数执行完毕后将其从栈中弹出, 并始终让 activeEffect 指向栈顶的副作用函数, 这样的话可以做到一个 响应式数据 只会收集直接读取其值的副作用函数，而不会出现互相影响的情况
 */
export const effectStack = [];
/**
 * @description: target => { key1 => [effectFn,effectFn,……], key2 => [effectFn,effectFn,……] }
 */
export const targetMap = new Map();

/**
 * @description: 追踪标记
 * 作用: shouldTrack 为 true, 进行追踪；shouldTrack 为 false, 不进行追踪
 */
export let shouldTrack = true;

export const ITERATE_KEY = Symbol();
export const MAP_KEY_ITERATE_KEY = Symbol();

/**
 * @description: 操作类型 Map
 * 作用: 对于 for……in 的拦截操作, 我们对触发依赖的操作做了区分:
 *    obj.xx = yy  => 如果 .xx 为新增属性, 那么 effect 副作用函数会重新执行
 *    obj.xx = yy  => 如果 .xx 不是新增属性, 那么 effect 副作用函数不需要重新执行
 * 对于 for……in 的响应策略, 新增属性触发 effect 副作用函数重新执行, 已有属性忽略 effect 副作用函数重新执行, 这样的话避免了不必要的性能损耗。
 */
export const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE'
};

/**
 * @description: 暂停追踪
 */
export function pauseTracking() {
  shouldTrack = false;
}

/**
 * @description: 继续追踪
 */
export function enableTracking() {
  shouldTrack = true;
}

/**
 * @description: 重置追踪
 */
export function resetTracking() {
  shouldTrack = true;
}

/**
 * @description: 清除副作用函数
 * @param {*} effectFn
 * 作用: 每次副作用函数执行时, 先把它从所有与之关联的依赖集合中删除，然后重置 effectFn.deps 数组。这样的话，在副作用函数执行完毕后, 会重新建立联系, 但在新的联系中不会包含遗留的副作用函数。
 */
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }

  effectFn.deps.length = 0;
}

/**
 * @description: 副作用函数
 * @param {*} fn
 * @param {*} options
 */
export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };

  effectFn.options = options;
  /**
   * @description: 存储所有包含当前副作用函数的依赖集合
   */
  effectFn.deps = [];

  /**
   * @description: effect 通过 options.lazy 实现懒计算， 只有访问读取值的时候才会去计算
   * @param {*} options
   * 作用: 懒计算, 只有访问读取其值时才会调用 effectFn() 去计算结果（此时,多次访问调用计算多次，并没有缓存结果）
   */
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

/**
 * @description: 依赖收集
 * @param {*} target
 * @param {*} key
 */
export function track(target, key) {
  if (!activeEffect || !shouldTrack) {
    return;
  }

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  /**
   * @description: 将当前激活的副作用函数 activeEffect 添加到依赖集合 deps 中
   */
  deps.add(activeEffect);
  /**
   * @description: deps 是一个与当前副作用函数存在联系的依赖集合, 因此将 deps 添加到 activeEffect.deps 数组中
   */
  activeEffect.deps.push(deps);
}

/**
 * @description: 依赖触发
 */
export function trigger(target, type, key, value) {
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    return;
  }

  const effectsToRun = new Set();

  if (key === 'length' && Array.isArray(target)) {
    /**
     * @description: length 属性发生变化之后, 元素重新执行副作用策略（修改 length ，会隐式影响数组元素，需要对元素的副作用函数做响应处理）
     * 作用: 对于 array.length 发生变化之后, 数组元素是否重新执行对应的副作用函数, 我们有如下策略:
     *      array.length = xx; 此时, 循环遍历 array , 只有 array 中索引值大于等于 xx 的元素才需要重新执行与这些元素相对应的所有的副作用函数
     */
    const newLength = Number(value);
    depsMap.forEach((effects, key) => {
      if (key === 'length' || key >= newLength) {
        effects &&
          effects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
              effectsToRun.add(effectFn);
            }
          });
      }
    });
  } else {
    if (key != undefined) {
      const keyEffects = depsMap.get(key);

      keyEffects &&
        keyEffects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn);
          }
        });
    }

    switch (type) {
      case TriggerType.ADD:
        if (!isArray(target)) {
          /**
           * @description: 对象数组 for……in 循环重新执行副作用策略
           * 作用: 对于 for……in 的是否重新执行副作用函数, 我们有如下策略:
           *    obj.xx = yy  => 如果 .xx 为新增属性, 那么 ITERATE_KEY 对应的 effect 副作用函数会重新执行
           *    obj.xx = yy  => 如果 .xx 不是新增属性, 那么 ITERATE_KEY 对应的  effect 副作用函数不需要重新执行
           *    delete obj.xx => 删除操作会使 obj 的 key 减少, 它会影响 for……in 的循环次数, 我们应该让 ITERATE_KEY 对应的 effect 副作用函数重新执行
           * 对于 for……in 的响应策略, 新增属性触发 effect 副作用函数重新执行, 已有属性忽略 effect 副作用函数重新执行, 这样的话避免了不必要的性能损耗。
           */
          const iterateKeyEffects = depsMap.get(ITERATE_KEY);
          iterateKeyEffects &&
            iterateKeyEffects.forEach(effectFn => {
              if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
              }
            });
          if (isMap(target)) {
            /**
             * @description: Map for…of 循环重新执行副作用策略
             * 1. 操作类型为 ADD 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
             * 2. 操作类型为 DELETE 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
             * 3. 操作类型为 SET 且为 Map 类型 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
             */
            const mapIterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
            mapIterateEffects &&
              mapIterateEffects.forEach(effectFn => {
                if (effectFn !== activeEffect) {
                  effectsToRun.add(effectFn);
                }
              });
          }
        } else if (isIntegerKey(key)) {
          /**
           * @description: length 属性重新执行副作用策略
           * 作用: 对于 array.length 是否重新执行副作用函数, 我们有如下策略:
           *      array[xx] = yy => xx 为新增索引值 , 此时, length 增加,  需要重新执行与 length 属性相关的副作用函数
           */
          const lengthEffects = depsMap.get('length');
          lengthEffects &&
            lengthEffects.forEach(effectFn => {
              if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
              }
            });
        }
        break;
      case TriggerType.DELETE:
        if (!isArray(target)) {
          /**
           * @description: 对象数组 for……in 循环重新执行副作用策略
           * 作用: 对于 for……in 的是否重新执行副作用函数, 我们有如下策略:
           *    obj.xx = yy  => 如果 .xx 为新增属性, 那么 ITERATE_KEY 对应的 effect 副作用函数会重新执行
           *    obj.xx = yy  => 如果 .xx 不是新增属性, 那么 ITERATE_KEY 对应的  effect 副作用函数不需要重新执行
           *    delete obj.xx => 删除操作会使 obj 的 key 减少, 它会影响 for……in 的循环次数, 我们应该让 ITERATE_KEY 对应的 effect 副作用函数重新执行
           * 对于 for……in 的响应策略, 新增属性触发 effect 副作用函数重新执行, 已有属性忽略 effect 副作用函数重新执行, 这样的话避免了不必要的性能损耗。
           */
          const iterateKeyEffects = depsMap.get(ITERATE_KEY);
          iterateKeyEffects &&
            iterateKeyEffects.forEach(effectFn => {
              if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
              }
            });
          if (isMap(target)) {
            /**
             * @description: Map for…of 循环重新执行副作用策略
             * 1. 操作类型为 ADD 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
             * 2. 操作类型为 DELETE 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
             * 3. 操作类型为 SET 且为 Map 类型 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
             */
            const mapIterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
            mapIterateEffects &&
              mapIterateEffects.forEach(effectFn => {
                if (effectFn !== activeEffect) {
                  effectsToRun.add(effectFn);
                }
              });
          }
        }
        break;
      case TriggerType.SET:
        if (isMap(target)) {
          /**
           * @description: Map for…of 循环重新执行副作用策略
           * 1. 操作类型为 ADD 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
           * 2. 操作类型为 DELETE 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
           * 3. 操作类型为 SET 且为 Map 类型 触发 MAP_KEY_ITERATE_KEY 相关的副作用函数
           */
          const iterateKeyEffects = depsMap.get(ITERATE_KEY);
          iterateKeyEffects &&
            iterateKeyEffects.forEach(effectFn => {
              if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
              }
            });
        }
        break;
    }
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}
