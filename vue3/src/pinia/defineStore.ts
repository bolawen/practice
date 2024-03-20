import { SymbolPinia } from "./rootStore";
import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
} from "vue";

function createSetupStore(id, setup, pinia) {
  let scope;
  // 创建响应式 store
  const store = reactive({});

  // _e 能停止所有 store , 每个 store 还可以停止自己的
  const setupStore = pinia._e.run(() => {
    scope = effectScope();
    return scope.run(() => setup());
  });

  function wrapAction(name, action) {
    return function () {
      // 执行 action
      let ret = action.apply(store, arguments);
      return ret;
    };
  }

  for (let key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop === "function") {
      setupStore[key] = wrapAction(key, prop);
    }
  }

  Object.assign(store, setupStore);
  pinia._s.set(id, store);
  return store;
}

function createOptionsStore(id, options, pinia) {
  let { state, getters, actions } = options;
  let scope;
  // 创建响应式 store
  const store = reactive({});

  function setup() {
    pinia.state.value[id] = state ? state() : {};
    const localState = pinia.state.value[id];

    return Object.assign(
      localState,
      actions,
      Object.keys(getters || {}).reduce((computedGetters, name) => {
        computedGetters[name] = computed(() => {
          return getters[name].call(store, store);
        });
        return computedGetters;
      })
    );
  }

  // _e 能停止所有 store , 每个 store 还可以停止自己的
  const setupStore = pinia._e.run(() => {
    scope = effectScope();
    return scope.run(() => setup());
  });

  function wrapAction(name, action) {
    return function () {
      let ret = action.apply(store, arguments);
      return ret;
    };
  }

  for (let key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop === "function") {
      setupStore[key] = wrapAction(key, prop);
    }
  }

  Object.assign(store, setupStore);
  pinia._s.set(id, store);
}

export function defineStore(idOrOptions, setup) {
  let id;
  let options;

  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    id = idOrOptions.id;
    options = idOrOptions;
  }
  const isSetupStore = typeof setup === "function";

  function useStore() {
    const currentInstance = getCurrentInstance();
    const pinia = currentInstance && inject(SymbolPinia);
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        // setup 为 function 时, 说明为 setup 语法, 创建 setup store
        createSetupStore(id, setup, pinia);
      } else {
        // setup 为 object 时, 说明为 options 语法, 创建 options store
        createOptionsStore(id, options, pinia);
      }
    }
    const store = pinia._s.get(id);
    return store;
  }

  return useStore;
}
