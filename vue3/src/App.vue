<template>
  <div>
    <div>stateStore.state.name 值为: {{ stateStore.state.name }}</div>
    <div>
      stateStore.computedStateName 值为: {{ stateStore.computedStateName }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStateStore } from "./store/stateStore";

const stateStore = useStateStore();
setTimeout(() => {
  stateStore.updateState({
    name: "张三",
  });
});
</script>
./store/stateStore
