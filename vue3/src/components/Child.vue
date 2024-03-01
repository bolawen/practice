<template>
  <div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import eventBus from "../eventBus.js"

onMounted(()=>{
  eventBus.$on('v-click',(value)=>{
    console.log(value);
  });
});
</script>
