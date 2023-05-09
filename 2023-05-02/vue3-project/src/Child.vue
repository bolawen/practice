<template>
  <div>
    {{ a }}
    {{ b.a }}

    <button @click="b.changeA(10)">子组件按钮</button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const a = inject('a')
const b = inject('b');
</script>
