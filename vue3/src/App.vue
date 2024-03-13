<template>
  <div>
    <Child v-model="count"></Child>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Child  from './components/Child.vue'

const count = ref(0);
</script>
