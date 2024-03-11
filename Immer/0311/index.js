function produce(baseState, recipe) {
  // 用于缓存被修改的对象, key 为原对象, value 为修改后的对象
  const copies = new Map();
  // 用于存储被代理的对象, key 为原对象, value 为代理对象
  const proxies = new Map();

  const handler = {
    get(target, prop) {
      return createProxy(getCurrentSource(target)[prop]);
    },
    set(target, prop, value) {
      if (target[prop] === value) {
        return true;
      }
      const copy = getOrCreateCopy(target);
      copy[prop] = value;
      return true;
    },
    has(target, prop) {
      return prop in getCurrentSource(target);
    },
    ownKeys(target) {
      return Reflect.ownKeys(getCurrentSource(target));
    },
    deleteProperty(target, property) {
      const copy = getOrCreateCopy(target);
      delete copy[property];
      return true;
    },
  };

  /**
   * @description: 返回当前资源对象, 如果对象被修改过, 则返回修改后的对象。
   * 说明: 数据如果被修改了很多次，那么我们获取正确数据的方法就是先查找数据是否被拷贝，被拷贝说明一定被修改了，没有被拷贝，说明没有被修改
   */
  function getCurrentSource(base) {
    const copy = copies.get(base);
    return copy || base;
  }

  function getOrCreateCopy(base) {
    let copy = copies.get(base);
    if (!copy) {
      copy = Array.isArray(base) ? [...base] : { ...base };
      copies.set(base, copy);
    }
    return copy;
  }

  function createProxy(base) {
    if (isPlainObject(base) || Array.isArray(base)) {
      let proxy = proxies.get(base);
      if (!proxy) {
        proxy = new Proxy(base, handler);
        proxies.set(base, proxy);
      }
      return proxy;
    }
    return base;
  }

  function hasChanges(base) {
    const proxy = proxies.get(base);
    if (!proxy) {
      return false;
    }
    if (copies.has(base)) {
      return true;
    }
    const keys = Object.keys(base);
    for (let i = 0; i < keys.length; i++) {
      const value = base[keys[i]];
      if ((Array.isArray(value) || isPlainObject(value)) && hasChanges(value)) {
        return true;
      }
    }
    return false;
  }

  function finalize(state) {
    if (isPlainObject(state) || Array.isArray(state)) {
      if (!hasChanges(state)) {
        return state;
      }
      const copy = getOrCreateCopy(state);
      if (Array.isArray(copy)) {
        copy.forEach((value, index) => {
          copy[index] = finalize(copy[index]);
        });
      } else {
        Object.keys(copy).forEach((prop) => {
          copy[prop] = finalize(copy[prop]);
        });
      }
      return Object.freeze(copy);
    }
    return state;
  }

  function isPlainObject(value) {
    if (value === null || typeof value !== "object") {
      return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  const proxy = createProxy(baseState);
  recipe(proxy);
  return finalize(baseState);
}

const state = {
  info: {
    name: "张三",
    age: 20,
  },
  list: [1, 2, 3],
};

const newState = produce(state, (draftState) => {
  draftState.info.age = 21;
});

console.log("newState", newState);
console.log("state === newState", state === newState);
console.log("state.info === newState.info", state.info === newState.info);
console.log("state.list === newState.list", state.list === newState.list);
