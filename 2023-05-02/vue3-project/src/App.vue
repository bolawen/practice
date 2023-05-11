<template>
  <div>
    <ProgressBar :isFinished="isFinished"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ProgressBar from "./components/ProgressBar.vue"

const isFinished = ref(false);

setTimeout(()=>{
  isFinished.value = true;
},8000);
</script>
