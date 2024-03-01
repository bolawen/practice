<template>
  <div>
    <h3>GrandChild 组件</h3>
    {{ $attrs.a }}
    {{ $attrs.b }}
    {{ $attrs.c }}
    <button @click="$attrs.onHandleChange">改变</button>
  </div>
</template>

<script setup>
import { useAttrs } from 'vue';

const attrs = useAttrs();
console.log('attrs', attrs);
</script>
