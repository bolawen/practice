<template>
  <div>
    <button @click="say">按钮</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['say']);

const say = ()=>{
  emit('say',"哈哈哈");
}
</script>
