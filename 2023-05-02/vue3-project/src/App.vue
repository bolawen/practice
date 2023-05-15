<template>
  <div>
    {{ store.a }}
    {{ store.countA }}

    <Child></Child>
  </div>
</template>

<script setup lang="ts">
import Child from './Child.vue'
import { useGlobalState } from './stores/useGlobalState';
const store = useGlobalState();
</script>
