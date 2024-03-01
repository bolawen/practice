const targetMap = new WeakMap();
const proxyMap = new WeakMap();
let shouldTrack = true;
const trackStack = [];
let activeEffect = null;
const ITERATE_KEY = Symbol('iterate');

const ReactiveFlags = {
  SKIP: '__v_skip',
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadonly',
  IS_SHALLOW: '__v_isShallow',
  RAW: '__v_raw'
};

const TrackOpTypes = {
  GET: 'get',
  HAS: 'has',
  ITERATE: 'iterate'
};

const TriggerOpTypes = {
  SET: 'set',
  ADD: 'add',
  DELETE: 'delete',
  CLEAR: 'clear'
};

const isArray = Array.isArray;

function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function hasIsChanged(value, oldValue) {
  return !Object.is(value, oldValue);
}

function isIntegerKey(key) {
  return (
    typeof key === 'string' &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key
  );
}

function isObject(value) {
  return typeof value === 'object' && value != null;
}

class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.deps = [];
    this.parent = undefined;
    this.scheduler = scheduler;
  }
  run() {
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;

    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }

    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      return this.fn();
    } finally {
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = undefined;
    }
  }
}

function effect(fn, options = {}) {
  if (fn.effect) {
    fn = fn.effect.fn;
  }

  const _effect = new ReactiveEffect(fn);
  if (options) {
    Object.assign(_effect, options);
  }

  if (!options || !options.lazy) {
    _effect.run();
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

function toRaw(observed) {
  const raw = observed && observed[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed;
}

function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    trackEffects(dep);
  }
}

function trackEffects(dep) {
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === TriggerOpTypes.CLEAR) {
    deps = [...depsMap];
  } else if (key === 'length' && isArray(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key) {
      deps.push(depsMap.get(key));
    }

    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get('length'));
        }
        break;
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
      case TriggerOpTypes.SET:
        break;
    }
  }

  if (deps.length === 1) {
    if (deps[0]) {
      triggerEffects(deps[0]);
    }
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    triggerEffects(new Set(effects));
  }
}

function triggerEffects(dep) {
  const effects = isArray(dep) ? dep : [...dep];
  for (const effect of effects) {
    triggerEffect(effect);
  }
}

function triggerEffect(effect) {
  if (effect != activeEffect) {
    if (effect.schedular) {
      effect.schedular();
    } else {
      effect.run();
    }
  }
}

function hasOwnProperty(target, key) {
  const obj = toRaw(target);
  track(obj, TrackOpTypes.HAS, key);
  return obj.hasOwnProperty(key);
}

function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}

function enableTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}

function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
}

function createArrayInstrumentations() {
  const instrumentations = {};
  ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
    instrumentations[key] = function (...args) {
      const arr = toRaw(this);
      for (let i = 0; i < this.length; i++) {
        track(arr, TrackOpTypes.GET, i + '');
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map[toRaw]);
      } else {
        return res;
      }
    };
  });
  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
    instrumentations[key] = function (...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}

const arrayInstrumentations = createArrayInstrumentations();

const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.RAW) {
      return target;
    }

    const targetIsArray = isArray(target);

    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }

    if (key === 'hasOwnProperty') {
      return hasOwnProperty;
    }

    const res = Reflect.get(target, key, receiver);

    track(target, TrackOpTypes.GET, key);

    if (isObject(res)) {
      return reactive(res);
    }

    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    oldValue = toRaw(oldValue);
    value = toRaw(value);

    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);

    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value);
      } else if (hasIsChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue);
      }
    }
    return result;
  },
  deleteProperty(target, key) {
    const hasKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hasKey) {
      trigger(target, TriggerOpTypes.DELETE, undefined, oldValue);
    }
    return result;
  },
  has(target, key) {
    const result = Reflect.has(target, key);
    track(target, TrackOpTypes.HAS, key);
    return result;
  },
  ownKeys(target) {
    console.log('kkk');
    track(
      target,
      TrackOpTypes.ITERATE,
      isArray(target) ? 'length' : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
};

function createReactiveObject(target) {
  if (typeof target !== 'object' || target == null) {
    return target;
  }
  if (target[ReactiveFlags.RAW]) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

function reactive(target) {
  return createReactiveObject(target);
}

function compile(options) {
  const template = options.template;
  const interpolationReg = /\{\{(.*)\}\}/;
  const el = document.querySelector(options.el);

  const match = interpolationReg.exec(template);
  el.innerHTML = template.replace(interpolationReg, options.data[match?.[1]]);
}

const data = reactive({
  a: 1,
  b: {
    c: 2
  },
  d: [1, 2, 3]
});

effect(() => {
  compile({
    el: '#app',
    template: `{{a}}`,
    data: data
  });
});

setTimeout(() => {
  data.a = '嘻嘻';
}, 2000);
