<template>
  <div>
    {{ state.count }}

    <button @click="changeCount">按钮</button>
  </div>
</template>

<script setup lang="ts">
import { state } from './stores/reactive'

const changeCount = () => {
  state.count += 1
}
</script>
