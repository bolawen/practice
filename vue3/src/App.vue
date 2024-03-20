<template>
  <div>
    <div>stateStore.state.name 值为: {{ stateStore.state.name }}</div>
    <div>
      stateStore.computedStateName 值为: {{ stateStore.computedStateName }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  effectScope,
  onScopeDispose,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useStateStore } from "./store/stateStore";

const stateStore = useStateStore();
setTimeout(() => {
  stateStore.updateState({
    name: "张三",
  });
});

const counter = ref(2);
const scope = effectScope();
scope.run(() => {
  const doubled = computed(() => counter.value * 2);
  watch(doubled, () => console.log("watch:", doubled.value));
  watchEffect(() => console.log("watchEffect:", doubled.value));

  onScopeDispose(() => {
    console.log("scope disposed");
  });
});

setTimeout(() => {
  counter.value = 3; // 更改 counter 的值，会触发 watch 和 watchEffect
}, 1000);

setTimeout(() => {
  scope.stop(); // 停止掉 scope 作用域内的所有 effect 副作用
}, 3000);

setTimeout(() => {
  counter.value = 5; // 再次更改 counter 的值，但是由于 scope 已经停止，所以不会触发 watch 和 watchEffect
}, 5000);
</script>
