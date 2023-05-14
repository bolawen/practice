<template>
  <div>
    {{ state.count }}

    <Child></Child>
  </div>
</template>

<script setup lang="ts">
import Child from './Child.vue'
import { state } from './stores/reactive'
</script>
