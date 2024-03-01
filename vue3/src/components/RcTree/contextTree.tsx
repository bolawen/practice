import { inject, provide, shallowRef } from 'vue';

const KeysStateKey = Symbol('keysStateKey');

export const useProvideKeysState = state => {
  provide(KeysStateKey, state);
};

export const useInjectKeysState = () => {
  return inject(KeysStateKey, {
    keyEntities: shallowRef({}),
    flattenNodes: shallowRef([]),
    expandedKeys: shallowRef([]),
    onNodeExpand: () => {}
  });
};
