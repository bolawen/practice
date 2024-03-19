import { Pinia } from "pinia";
import { SymbolPinia } from "./rootStore";
import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
} from "vue";

function createOptionsStore(id: any, options: any, pinia: any) {
  let { state, getters, actions } = options;
  let scope;
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

export function defineStore(idOrOptions: any, setup?: any) {
  let id: string;
  let options: any;

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
    const pinia: any = currentInstance && inject(SymbolPinia);
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createOptionsStore(id, setup, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }
    const store = pinia._s.get(id);
    return store;
  }

  return useStore;
}
