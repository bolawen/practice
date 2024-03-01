import {
  track,
  ITERATE_KEY,
  MAP_KEY_ITERATE_KEY,
  trigger,
  TriggerType
} from './effect';
import { hasChanged,hasOwn } from '../util';
import { reactive, ReactiveFlags, toRaw } from './reactive';

const createIterableMethod = () => {
  return function () {
    const wrap = val =>
      typeof val === 'object' && val != null ? reactive(val) : val;
    const target = toRaw(this);
    const iterator = target[Symbol.iterator]();

    track(target, ITERATE_KEY);

    return {
      next() {
        const { value, done } = iterator.next();
        return {
          value: value ? [wrap(value[0]), wrap(value[1])] : value,
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
};

const createValuesIterableMethod = () => {
  return function () {
    const wrap = val =>
      typeof val === 'object' && val != null ? reactive(val) : val;
    const target = toRaw(this);
    const iterator = target.values();
    track(target, ITERATE_KEY);

    return {
      next() {
        const { value, done } = iterator.next();
        return {
          value: wrap(value),
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
};

const createKeysIterableMethod = () => {
  return function () {
    const wrap = val =>
      typeof val === 'object' && val != null ? reactive(val) : val;
    const target = toRaw(this);
    const iterator = target.keys();
    track(target, MAP_KEY_ITERATE_KEY);

    return {
      next() {
        const { value, done } = iterator.next();
        return {
          value: wrap(value),
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
};

const createInstrumentations = () => {
  const mutableInstrumentations = {
    get(key) {
      const target = this.raw;
      const had = target.has(key);
      track(target, key);
      if (had) {
        const result = target.get(key);
        return typeof result === 'object' ? reactive(result) : res;
      }
    },
    get size() {
      const target = this[ReactiveFlags.RAW];
      track(toRaw(target), ITERATE_KEY);
      return Reflect.get(target, 'size', target);
    },
    set(key, value) {
      /**
       * @description: 得到原始数据
       * value 可能是原始数据, 直接 target.set()
       * value 可能是响应式数据, 需要获取 value.raw 得到原始数据
       */
      value = toRaw(value);
      const target = toRaw(this);
      const had = target.has(key);
      const oldValue = target.get(key);
      /**
       * @description: target.set(key, value) value 必须为原始数据
       * 作用: 将响应式数据设置到原始数据上的行为成为数据污染, 因为将响应式数据设置到原始数据上之后, 原始数据就具有了响应式数据的能力了，这不是我们期望的行为。
       */
      target.set(key, value);

      if (!had) {
        trigger(target, TriggerType.ADD, key);
      } else if (hasChanged(oldValue, value)) {
        trigger(target, TriggerType.SET, key);
      }
    },
    add(value) {
      /**
       * @description: 得到原始数据
       * value 可能是原始数据, 直接 target.set()
       * value 可能是响应式数据, 需要获取 value.raw 得到原始数据
       */
      value = toRaw(value);
      const target = toRaw(this);
      const hadKey = target.has(value);
      /**
       * @description: target.add(value) value 必须为原始数据
       * 作用: 将响应式数据设置到原始数据上的行为成为数据污染, 因为将响应式数据设置到原始数据上之后, 原始数据就具有了响应式数据的能力了，这不是我们期望的行为。
       */
      const result = target.add(value);
      if (!hadKey) {
        trigger(target, TriggerType.ADD, value);
      }
      return result;
    },
    delete(key) {
      const target = toRaw(this);
      const hadKey = target.has(key);
      const result = target.delete(key);
      if (hadKey) {
        trigger(target, TriggerType.DELETE, key);
      }
      return result;
    },
    forEach(callback, thisArg) {
      const wrap = val =>
        typeof val === 'object' && val != null ? reactive(val) : val;
      const target = toRaw(this);
      track(target, ITERATE_KEY);
      target.forEach((v, k) => {
        callback.call(thisArg, wrap(v), wrap(k), this);
      });
    },
    entries: createIterableMethod('entries'),
    [Symbol.iterator]: createIterableMethod('Symbol.iterator'),
    values: createValuesIterableMethod('values'),
    keys: createKeysIterableMethod('keys')
  };

  return [mutableInstrumentations];
};

const [mutableInstrumentations] = createInstrumentations();

function createInstrumentationGetter(isReadonly = false, isShallow = false) {
  const instrumentations = mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === ReactiveFlags.RAW) {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations
        : target,
      key,
      receiver
    );
  };
}

export const mutableCollectionHandlers = {
  get: createInstrumentationGetter(false, false)
};
