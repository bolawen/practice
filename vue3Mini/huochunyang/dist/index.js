(function () {
  'use strict';

  function is(x, y) {
    if (x === y) {
      return x !== 0 && 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function hasChanged(x, y) {
    return !is(x, y);
  }

  function toRawType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }

  /**
   * @description: 是否为对象
   */
  function isObject(value) {
    return value != null && typeof value === 'object';
  }

  /**
   * @description: 是否为数组
   */

  const isArray = Array.isArray;

  /**
   * @description: 是否为字符串
   */

  const isString = value => typeof value === 'string';

  /**
   * @description: 是否为 Map 对象
   */
  function isMap(value) {
    return Object.prototype.toString.call(value) === '[object Map]';
  }

  /**
   * @description: 是否数字型的字符串
   */
  const isIntegerKey = key =>
    isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;

  /**
   * @description: 是否为自身属性
   */
  const hasOwn = (val, key) =>
    Object.prototype.hasOwnProperty.call(val, key);

  /**
   * @description: 是否为 Symbol
   */
  const isSymbol = val => typeof val === 'symbol';

  /**
   * @description: 当前激活的副作用(effect)函数
   */
  let activeEffect;
  /**
   * @description: 副作用(effect)函数栈
   * 作用: 在副作用执行时, 将当前副作用函数压入栈中,待副作用函数执行完毕后将其从栈中弹出, 并始终让 activeEffect 指向栈顶的副作用函数, 这样的话可以做到一个 响应式数据 只会收集直接读取其值的副作用函数，而不会出现互相影响的情况
   */
  const effectStack = [];
  /**
   * @description: target => { key1 => [effectFn,effectFn,……], key2 => [effectFn,effectFn,……] }
   */
  const targetMap = new Map();

  /**
   * @description: 追踪标记
   * 作用: shouldTrack 为 true, 进行追踪；shouldTrack 为 false, 不进行追踪
   */
  let shouldTrack = true;

  const ITERATE_KEY = Symbol();
  const MAP_KEY_ITERATE_KEY = Symbol();

  /**
   * @description: 操作类型 Map
   * 作用: 对于 for……in 的拦截操作, 我们对触发依赖的操作做了区分:
   *    obj.xx = yy  => 如果 .xx 为新增属性, 那么 effect 副作用函数会重新执行
   *    obj.xx = yy  => 如果 .xx 不是新增属性, 那么 effect 副作用函数不需要重新执行
   * 对于 for……in 的响应策略, 新增属性触发 effect 副作用函数重新执行, 已有属性忽略 effect 副作用函数重新执行, 这样的话避免了不必要的性能损耗。
   */
  const TriggerType = {
    SET: 'SET',
    ADD: 'ADD',
    DELETE: 'DELETE'
  };

  /**
   * @description: 暂停追踪
   */
  function pauseTracking() {
    shouldTrack = false;
  }

  /**
   * @description: 重置追踪
   */
  function resetTracking() {
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
  function effect(fn, options = {}) {
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
  function track(target, key) {
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
  function trigger(target, type, key, value) {
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

  function shouldSetAsProps(el, key, value) {
    if (key === 'form' && el.tagName === 'INPUT') {
      return false;
    }
    return key in el;
  }

  function patchClass(el, value) {
    el.className = value || '';
  }

  function patchEvent(el, key, prevValue, nextValue) {
    const invokers = el._vei || (el._vei = {});
    let invoker = invokers[key];
    const name = key.slice(2).toLowerCase();
    if (nextValue) {
      /**
       * @description:  如果 nextValue 存在 且 没有 invoker ，伪造一个 invoker 并缓存到 el._vei 中
       */
      if (!invoker) {
        invoker = el._vei[key] = e => {
          /**
           * @description: 如果事件发生的时间早于事件处理函数绑定的时间,则不执行事件处理函数
           */
          if (e.timeStamp < invoker.attached) {
            return;
          }

          /**
           * @description: invoker.value 是数组，则遍历 invoker.value 逐个调用事件处理函数
           */
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e));
          } else {
            invoker.value(e);
          }
        };
        invoker.value = nextValue;
        /**
         * @description: invoker.attached 存储事件处理函数被绑定的时间
         */
        invoker.attached = performance.now();
        el.addEventListener(name, invoker);
      } else {
        /**
         * @description: 如果 nextValue 存在 且 之前有 invoker， 只需要更新 invoker.value 的值即可
         */
        invoker.value = nextValue;
      }
    } else if (invoker) {
      /**
       * @description: 如果 nextValue 不存在, 且 之前有 invoker, 则移除绑定事件
       */
      el.removeEventListener(name, invoker);
    }
  }

  function patchProp(el, key, prevValue, nextValue) {
    if (key === 'class') {
      patchClass(el, nextValue);
    } else if (key === 'style') ; else if (/^on/.test(key)) {
      patchEvent(el, key, prevValue, nextValue);
    } else if (shouldSetAsProps(el, key)) {
      // 通过 shouldSetAsProps 判断 key 属性是否是可读属性 或者 存在于 DOM Properties 中
      const type = typeof el[key];
      if (type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      // 如果要设置的属性没有对应的 DOM Properties 或者是可读属性， 则使用 setAttribute 来设置属性
      el.setAttribute(key, nextValue);
    }
  }

  // queue 任务缓存队列
  const queue = new Set();

  // resolve 的 Promise 实例
  const p = Promise.resolve();

  // isFlushing 标志: 是否正在刷新任务队列
  let isFlushing = false;

  /**
   * @description: queueJob
   * @param {*} job
   * 作用: 将一个任务或副作用函数添加到缓冲队列, 并开始刷新队列
   */
  function queueJob(job) {
    queue.add(job);
    if (!isFlushing) {
      isFlushing = true;
      p.then(() => {
        try {
          queue.forEach(job => job());
        } finally {
          isFlushing = false;
          queue.clear = 0;
        }
      });
    }
  }

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
          trigger(target, TriggerType.SET, key, value);
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

  const mutableHandlers = {
    get,
    set,
    has,
    ownKeys,
    deleteProperty
  };

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
      entries: createIterableMethod(),
      [Symbol.iterator]: createIterableMethod(),
      values: createValuesIterableMethod(),
      keys: createKeysIterableMethod()
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

  const mutableCollectionHandlers = {
    get: createInstrumentationGetter(false, false)
  };

  /**
   * @description: 定义一个 Map 实例, 存储原始对象到代理对象的映射
   */
  const reactiveMap = new WeakMap();
  const TargetType = {
    invalid: 0,
    common: 1,
    collection: 2
  };
  const ReactiveFlags = {
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

  function reactive(target) {
    return createReactiveObject(
      target,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }

  function shallowReactive(target) {
    return createReactiveObject(
      target,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }

  function readonly(target) {
    return createReactiveObject(
      target,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }

  function shallowReadonly(target) {
    return createReactiveObject(
      target,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }

  function toRaw(observed) {
    const raw = observed && observed[ReactiveFlags.RAW];
    return raw ? toRaw(raw) : observed;
  }

  function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }

  function resolveProps(options, propsData) {
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

  function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevPorps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key]) {
        return true;
      }
    }
    return false;
  }

  const Text = Symbol('v-text');
  const Comment = Symbol('v-comment');
  const Static = Symbol('v-static');
  const Fragment = Symbol('v-fragment');
  const EMPTY_ARR = [];

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

  function onMounted(fn) {
    if (currentInstance) {
      currentInstance.mounted.push(fn);
    } else {
      console.log('onMounted 函数只能在 setup 中调用');
    }
  }

  function createRenderer(options) {
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
          } else ;
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
        updateComponent(n1, n2);
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

  // const data = {
  //   a: 'hello world',
  //   b: 0,
  //   c: 1,
  //   d: 1,
  //   e: {
  //     f: 1
  //   }
  // };

  // const obj = reactive(data);

  // setTimeout(() => {
  //   obj.a = 'hello world 修改';
  // }, 3000);

  // effect(() => {
  //   console.log(obj.a);
  // });

  // setTimeout(() => {
  //   obj.b++;
  // }, 2000);

  // effect(() => {
  //   console.log(obj.b);
  // });
  /**
   * @description: 嵌套的 effecdt
   */

  // effect(() => {
  //   effect(() => {
  //     console.log('内层', obj.b);
  //   });
  //   console.log('外层', obj.a);
  // });

  // obj.a = 'hello world 修改';

  /**
   * @description: 避免无限递归循环
   */

  // effect(() => {
  //   obj.c++;
  // });

  /**
   * @description: 调度器调度执行 控制 副作用函数的执行顺序
   */

  // effect(
  //   () => {
  //     console.log(obj.c);
  //   },
  //   {
  //     scheduler(fn) {
  //       setTimeout(fn);
  //     }
  //   }
  // );

  // obj.c++;
  // console.log('obj.c 结束');

  /**
   * @description: 调度器调度执行 控制 副作用函数执行的次数, 可以去除过渡状态，只关心最终结果
   */
  // effect(
  //   () => {
  //     console.log(obj.d);
  //   },
  //   {
  //     scheduler(fn) {
  //       jobQueue.add(fn);
  //       flushJob();
  //     }
  //   }
  // );

  // obj.d++;
  // obj.d++;
  // obj.d++;

  /**
   * @description: computed 访问值；多次访问值； 修改依赖响应式数据, 再次多次访问值
   * @param {*} computed
   */
  // const computedA = computed(() => {
  //   return obj.b + obj.c;
  // });

  // console.log(computedA.value);
  // console.log(computedA.value);
  // console.log(computedA.value);

  // obj.b = 4;

  // console.log(computedA.value);
  // console.log(computedA.value);

  /**
   * @description: 在副作用函数中访问读取 computed 值, 此时, 依赖的响应式数据发生变更
   * @param {*} computed
   */
  // const computedB = computed(() => {
  //   return obj.b + obj.c;
  // });

  // effect(() => {
  //   console.log(computedB.value);
  // });

  // obj.b++;

  /**
   * @description: watch 监听响应式数据
   */
  // watch(obj, (newValue, oldValue) => {
  //   console.log(newValue.c, oldValue.c);
  // });

  // obj.c++;

  /**
   * @description: watch 监听 getter 函数
   */

  // watch(
  //   () => obj.c,
  //   (newValue, oldValue) => {
  //     console.log(newValue, oldValue);
  //   }
  // );

  // obj.c++;

  /**
   * @description: watch 立即执行回调函数
   */

  // watch(
  //   () => obj.c,
  //   (newValue, oldValue) => {
  //     console.log(newValue, oldValue);
  //   },
  //   {
  //     immediate: true
  //   }
  // );

  /**
   * @description: watch 回调函数执行时机
   */
  // watch(
  //   () => obj.c,
  //   (newValue, oldValue) => {
  //     console.log(newValue, oldValue);
  //   },
  //   {
  //     flush: 'sync' // ‘pre’ | 'post' | 'sync'
  //   }
  // );

  // obj.c++;

  /**
   * @description: watch 竞态问题的处理（过期的副作用）
   *
   * 场景: 依次发送请求 A 和 B， 我们根据请求的发送顺序, 认为请求 B 是后发送的, 请求 B 的数据才是最新的， 请求 A 的返回数据应该视为过期的。
   */

  // function request() {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 1000);
  //   });
  // }

  // watch(
  //   () => obj.c,
  //   async (newValue, oldValue, onInvalidate) => {
  //     let expired = false;
  //     onInvalidate(() => {
  //       expired = true;
  //     });
  //     await request();
  //     if (!expired) {
  //       console.log(newValue, oldValue);
  //     }
  //   }
  // );

  // obj.c++;

  // setTimeout(() => {
  //   obj.c++;
  // }, 200);

  /**
   * @description: 拦截 in 操作符
   */

  // effect(() => {
  //   console.log('a' in obj);
  // });
  // obj.a = 'hello world 修改';

  /**
   * @description: 拦截 for……in 循环
   */

  // effect(() => {
  //   for (const key in obj) {
  //     console.log(key);
  //   }
  // });

  // obj.f = 2; // 新增属性
  // // obj.b++; // 已有属性

  /**
   * @description: 拦截 delete 操作
   */

  // effect(() => {
  //   for (const key in obj) {
  //     console.log(key);
  //   }
  // });

  // delete obj.c;

  /**
   * @description: 深层响应和只读
   */

  // effect(() => {
  //   console.log(obj.e.f);
  // });

  // obj.c += 2;

  /**
   * @description: 通过 array[1] = xx; 改变数组
   */

  // const array = reactive([1]);

  // effect(() => {
  //   console.log(array.length);
  // });

  // array[1] = 2; // array.length 变为 2

  /**
   * @description: 通过 array.length = xx 改变数组
   */

  // const array = reactive([1, 2]);

  // effect(() => {
  //   console.log(array[0]);
  // });

  // array.length = 0;

  /**
   * @description: 通过 for(const index in array) 遍历数组
   */

  // const array = reactive([1, 2, 3]);
  // effect(() => {
  //   for (let index in array) {
  //     console.log(index);
  //   }
  // });

  // array[4] = '4';
  // array.length = 2;

  /**
   * @description: 通过 for(const item of array) 遍历数组
   */

  // const array = reactive([1, 2, 3]);
  // effect(() => {
  //   for (let item of array) {
  //     console.log(item);
  //   }
  // });

  // array[4] = '4';
  // array.length = 2;

  /**
   * @description: 通过 includes() 查找数组元素
   */

  // const obj = reactive({});
  // const array = reactive([obj]);
  // effect(() => {
  //   console.log(array.includes(array[0]));
  // });

  // array[0] = 1;

  // const obj = {};
  // const array = reactive([obj]);
  // effect(() => {
  //   console.log(array.includes(obj));
  // });

  // array[0] = 1;

  /**
   * @description: 通过 push() 添加元素
   */

  // const array = reactive([1,2]);

  // effect(()=>{
  //   for(let item of array){
  //     console.log(item)
  //   }
  // });

  // array.push(3);

  /**
   * @description: 通过 unshift() 添加元素
   */

  // const array = reactive(['a','b','c']);

  // effect(()=>{
  //   for(let item of array){
  //     console.log(item)
  //   }
  // });

  // array.unshift('d');

  /**
   * @description: 代理 Set 数据
   */

  // const proxy = reactive(new Set([1, 2, 3]));
  // console.log(proxy.size);
  // proxy.delete(2);
  // console.log(proxy.size);

  /**
   * @description: 代理 Map 数据
   */

  // const proxy = reactive(
  //   new Map([
  //     [1, 1],
  //     [2, 2],
  //     [3, 3]
  //   ])
  // );
  // console.log(proxy.size);
  // proxy.delete(2);
  // console.log(proxy.size);

  /**
   * @description: Set 响应
   */

  // const set = reactive(new Set([1, 2, 3]));

  // effect(() => {
  //   console.log(set.size);
  // });

  // set.add(4);

  /**
   * @description: Map 响应
   */

  // const map = reactive(new Map());

  // effect(() => {
  //   console.log(map.size);
  // });

  // map.set([1, 1]);

  /**
   * @description: Map 数据污染
   */

  // const map = new Map();
  // const proxy1 = reactive(map);
  // const proxy2 = reactive(new Map());
  // proxy1.set('proxy2', proxy2);

  // effect(() => {
  //   // 通过原始数据访问 proxy2
  //   console.log(map.get('proxy2').size);
  // });

  // // 通过原始数据修改 proxy2
  // map.get('proxy2').set([2, 2]);

  /**
   * @description: Map forEach
   */

  // const map = reactive(
  //   new Map([
  //     [1, 1],
  //     [2, 2],
  //     [3, 3]
  //   ])
  // );

  // effect(() => {
  //   map.forEach(item => {
  //     console.log(item);
  //   });
  // });

  // map.set(4, 4);

  /**
   * @description: Map for……of
   */

  // const map = reactive(
  //   new Map([
  //     [1, 1],
  //     [2, 2],
  //     [3, 3]
  //   ])
  // );

  // effect(() => {
  //   for (const item of map) {
  //     console.log(item);
  //   }
  // });

  // map.set(4, 4);

  /**
   * @description: Map entries 遍历
   */

  // const map = reactive(
  //   new Map([
  //     [1, 1],
  //     [2, 2],
  //     [3, 3]
  //   ])
  // );

  // effect(() => {
  //   for (const [key, value] of map.entries()) {
  //     console.log(key, value);
  //   }
  // });

  // map.set(4, 4);

  // /**
  //  * @description: Map values 遍历
  //  */

  // const map = reactive(
  //   new Map([
  //     [1, 1],
  //     [2, 2],
  //     [3, 3]
  //   ])
  // );

  // effect(() => {
  //   for (const value of map.entries()) {
  //     console.log(value);
  //   }
  // });

  // map.set(4, 4);
  // map.set(3, 3);

  /**
   * @description: render 渲染器 渲染 Element
   */

  // const renderOps = {
  //   createElement(tag) {
  //     return document.createElement(tag);
  //   },
  //   setElementText(el, text) {
  //     el.textContent = text;
  //   },
  //   insert(el, parent, anchor = null) {
  //     parent.insertBefore(el, anchor);
  //   }
  // };

  // const renderer = createRenderer({ ...renderOps, patchProp });

  // const data = reactive({ msg: 'Hello World' });

  // effect(() => {
  //   const vnode = {
  //     type: 'div',
  //     shapeFlag: 9,
  //     props: {
  //       id: 'id-div',
  //       style: {
  //         color: 'red'
  //       },
  //       class: 'class-div',
  //       onClick: [
  //         () => {
  //           console.log('1');
  //         },
  //         () => {
  //           console.log('2');
  //         }
  //       ]
  //     },
  //     children: [
  //       {
  //         type: 'h3',
  //         shapeFlag: 9,
  //         children: data.msg
  //       }
  //     ]
  //   };

  //   renderer.render(vnode, document.querySelector('#app'));
  // });

  // setTimeout(() => {
  //   data.msg = 'Hello World 修改';
  // }, 3000);

  /**
   * @description: render 渲染器 渲染 Text
   */

  // const renderOps = {
  //   setText(el, text) {
  //     el.nodeValue = text;
  //   },
  //   createText(text) {
  //     return document.createTextNode(text);
  //   },
  //   createComment(comment) {
  //     return document.createComment(comment);
  //   },
  //   createElement(tag) {
  //     return document.createElement(tag);
  //   },
  //   setElementText(el, text) {
  //     el.textContent = text;
  //   },
  //   insert(el, parent, anchor = null) {
  //     parent.insertBefore(el, anchor);
  //   }
  // };

  // const renderer = createRenderer({ ...renderOps, patchProp });

  // const data = reactive({ msg: 'Hello World' });

  // effect(() => {
  //   const vnode = {
  //     type: Text,
  //     children: data.msg
  //   };

  //   renderer.render(vnode, document.querySelector('#app'));
  // });

  // setTimeout(() => {
  //   data.msg = 'Hello World 修改';
  // }, 3000);

  /**
   * @description: render 渲染器 渲染 Comment
   */

  // const renderOps = {
  //   setText(el, text) {
  //     el.nodeValue = text;
  //   },
  //   createText(text) {
  //     return document.createTextNode(text);
  //   },
  //   createComment(comment) {
  //     return document.createComment(comment);
  //   },
  //   createElement(tag) {
  //     return document.createElement(tag);
  //   },
  //   setElementText(el, text) {
  //     el.textContent = text;
  //   },
  //   insert(el, parent, anchor = null) {
  //     parent.insertBefore(el, anchor);
  //   }
  // };

  // const renderer = createRenderer({ ...renderOps, patchProp });

  // const data = reactive({ msg: 'Hello World' });

  // effect(() => {
  //   const vnode = {
  //     type: Comment,
  //     children: data.msg
  //   };

  //   renderer.render(vnode, document.querySelector('#app'));
  // });

  // setTimeout(() => {
  //   data.msg = 'Hello World 修改';
  // }, 3000);

  /**
   * @description: render 渲染器 Diff
   * n1: (a b) c
   * n2: (a b) d e
   */

  // const renderOps = {
  //   setText(el, text) {
  //     el.nodeValue = text;
  //   },
  //   createText(text) {
  //     return document.createTextNode(text);
  //   },
  //   createComment(comment) {
  //     return document.createComment(comment);
  //   },
  //   createElement(tag) {
  //     return document.createElement(tag);
  //   },
  //   setElementText(el, text) {
  //     el.textContent = text;
  //   },
  //   insert(el, parent, anchor = null) {
  //     parent.insertBefore(el, anchor);
  //   }
  // };

  // const renderer = createRenderer({ ...renderOps, patchProp });

  // const oldData = ['a', 'b', 'c'];
  // const vnode = {
  //   type: 'div',
  //   shapeFlag: 9,
  //   children: oldData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
  // };
  // renderer.render(vnode, document.querySelector('#app'));

  // setTimeout(() => {
  //   const newData = ['a', 'b', 'd', 'e'];
  //   const vnode = {
  //     type: 'div',
  //     shapeFlag: 9,
  //     children: newData.map(item => ({
  //       type: 'div',
  //       shapeFlag: 9,
  //       children: item
  //     }))
  //   };
  //   renderer.render(vnode, document.querySelector('#app'));
  // }, 3000);

  /**
   * @description: render 渲染器 Diff
   * n1: a (b c)
   * n2: d e (b c)
   */

  // const renderOps = {
  //   setText(el, text) {
  //     el.nodeValue = text;
  //   },
  //   createText(text) {
  //     return document.createTextNode(text);
  //   },
  //   createComment(comment) {
  //     return document.createComment(comment);
  //   },
  //   createElement(tag) {
  //     return document.createElement(tag);
  //   },
  //   setElementText(el, text) {
  //     el.textContent = text;
  //   },
  //   insert(el, parent, anchor = null) {
  //     parent.insertBefore(el, anchor);
  //   }
  // };

  // const renderer = createRenderer({ ...renderOps, patchProp });

  // const oldData = ['a','b','c'];
  // const vnode = {
  //   type: 'div',
  //   shapeFlag: 9,
  //   children: oldData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
  // };

  // renderer.render(vnode, document.querySelector('#app'));

  // setTimeout(() => {
  //   const newData = ['d','e','b','c'];
  //   const vnode = {
  //     type: 'div',
  //     shapeFlag: 9,
  //     children: newData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
  //   };

  //   renderer.render(vnode, document.querySelector('#app'));
  // }, 3000);

  /**
   * @description: render 渲染器 Diff
   * n1: a b [c d e] f g
   * n2: a b [e d c h] f g
   */

  // const renderOps = {
  //   setText(el, text) {
  //     el.nodeValue = text;
  //   },
  //   createText(text) {
  //     return document.createTextNode(text);
  //   },
  //   createComment(comment) {
  //     return document.createComment(comment);
  //   },
  //   createElement(tag) {
  //     return document.createElement(tag);
  //   },
  //   setElementText(el, text) {
  //     el.textContent = text;
  //   },
  //   insert(el, parent, anchor = null) {
  //     parent.insertBefore(el, anchor);
  //   }
  // };

  // const renderer = createRenderer({ ...renderOps, patchProp });

  // const oldData = ['a','b','c','d','e','f','g'];
  // const vnode = {
  //   type: 'div',
  //   shapeFlag: 9,
  //   children: oldData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
  // };

  // renderer.render(vnode, document.querySelector('#app'));

  // setTimeout(() => {
  //   const newData = ['a','b','e','d','c','h','f','g'];
  //   const vnode = {
  //     type: 'div',
  //     shapeFlag: 9,
  //     children: newData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
  //   };

  //   renderer.render(vnode, document.querySelector('#app'));
  // }, 3000);

  // const map = reactive(new Map([[1,'嘻嘻'],[2,'哈哈']]));

  // effect(()=>{
  //   map.forEach((value,key)=>{
  //     console.log(value,key)
  //   });
  // });

  // map.set(3,'呵呵');

  /**
   * @description: render 渲染器 Component
   */

  const renderOps = {
    setText(el, text) {
      el.nodeValue = text;
    },
    createText(text) {
      return document.createTextNode(text);
    },
    createComment(comment) {
      return document.createComment(comment);
    },
    createElement(tag) {
      return document.createElement(tag);
    },
    setElementText(el, text) {
      el.textContent = text;
    },
    insert(el, parent, anchor = null) {
      parent.insertBefore(el, anchor);
    }
  };

  const renderer = createRenderer({ ...renderOps, patchProp });

  const AppComponent = {
    name: 'AppComponent',
    setup() {
      onMounted(() => {
        console.log('setup onMounted');
      });
    },
    render() {
      return {
        type: 'div',
        shapeFlag: 9,
        children: '嘻嘻'
      };
    }
  };

  const vnode = {
    shapeFlag: 4,
    type: AppComponent
  };

  renderer.render(vnode, document.querySelector('#app'));

})();
