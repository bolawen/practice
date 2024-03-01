import {
  hasChanged,
  isArray,
  hasOwn,
  isSymbol,
  isObject,
  isIntegerKey
} from '../util';
import {
  track,
  trigger,
  ITERATE_KEY,
  TriggerType,
  pauseTracking,
  resetTracking,
  shouldTrack
} from './effect';
import { reactive, readonly, ReactiveFlags, toRaw } from './reactive';

const arrayInstrumentations = createArrayInstrumentations();

function createArrayInstrumentations() {
  const instrumentations = {};
  ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
    const originMethod = Array.prototype[key];
    instrumentations[key] = function (...args) {
      for (let i = 0; i < this.length; i++) {
        track(this, i + '');
      }

      let result = originMethod.apply(this, args);
      if (result === false || result === -1) {
        result = originMethod.apply(this[ReactiveFlags.RAW], args);
      }
      return result;
    };
  });

  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
    const originMethod = Array.prototype[key];
    instrumentations[key] = function (...args) {
      // 调用原始方法之前, 暂停追踪
      pauseTracking();
      let result = originMethod.apply(this, args);
      // 调用原始方法之后, 允许追踪
      resetTracking();
      return result;
    };
  });
  return instrumentations;
}

function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.RAW) {
      /**
       * @description: 为代理对象增加 raw 属性, 通过 代理对象.raw 可以访问读取原始数据
       */
      return target;
    }

    const targetIsArray = isArray(target);

    if (!isReadonly) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        /**
         * @description: 如果 target 是数组, 并且 key 存在于 arrayInstrumentations 上, 那么返回定义在 arrayInstrumentations 上的值
         */
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
    }

    const res = Reflect.get(target, key, receiver);

    if (isSymbol(key)) {
      /**
       * @description: 使用 `for……of` 或者 `values()` 方法, 都会读取 `target.[Symbol.iterator]` 属性, 为了避免发生意外的错误以及性能上的考虑, 不应该在副作用函数与 `target[Symbol.iterator]` 之间建立响应联系, 所以在调用 `track` 函数进行追踪之前, 需要加一个判断条件, 即只有当 `key` 的类型不是 `symbol` 时才进行追踪。
       */
      return res;
    }

    if (!isReadonly) {
      /**
       * @description: 如果当期不是只读,调用 track 追踪
       */
      track(target, key);
    }

    if (isShallow) {
      return res;
    }

    if (isObject(res)) {
      /**
       * @description: 读取 代理对象属性值 时, 检测是否为对象, 如果是对象, 则递归调用 reactive 函数将其包装成响应式数据并返回。
       */
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

function createSetter(isReadonly = false, isShallow = false) {
  return function set(target, key, value, receiver) {
    let oldValue = target[key];

    if (isReadonly) {
      console.warn(`属性 ${key} 是只读的`);
      return false;
    }

    oldValue = toRaw(oldValue);
    value = toRaw(value);

    /**
     * @description: 判断是否有 key
     * 如果 target 为数组:
     *      如果 被设置的索引值 key 小于数组长度: 设置已有属性, type 为 set
     *      如果 被设置的索引值 key 大于数组长度: 添加新属性, type 为 add
     * 如果 target 为对象:
     *      如果属性存在: 设置已有属性, type 为 set
     *      如果属性不存在: 添加新属性, type 为 add
     */
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const res = Reflect.set(target, key, value, receiver);

    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerType.ADD, key, value);
      } else if (hasChanged(oldValue, value)) {
        trigger(target, TriggerType.SET, key, value, oldValue);
      }
    }

    return res;
  };
}

function has(target, key) {
  track(target, key);
  return Reflect.has(target, key);
}

function ownKeys(target) {
  /**
   * @description: ownKeys 拦截
   * 细节: 在 track 进行依赖收集时, 将 ITERATE_KEY 作为了依赖的 key 。 这是因为 ownKeys 拦截函数与 get/set 不同, 我们只能拿到目标对象的 target, 所以我们只能构造唯一的 key 作为标识。
   */
  track(target, isArray(target) ? 'length' : ITERATE_KEY);
  return Reflect.ownKeys(target);
}

function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger(target, TriggerType.DELETE, key,undefined);
  }
  return result;
}

const get = createGetter();
const set = createSetter();

export const mutableHandlers = {
  get,
  set,
  has,
  ownKeys,
  deleteProperty
};
