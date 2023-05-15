<template>
  <div>
    {{ store.a }}

    <button @click="store.setA(10)">按钮</button>
  </div>
</template>

<script setup lang="ts">
import { useGlobalState } from './stores/useGlobalState';
const store = useGlobalState();
</script>
