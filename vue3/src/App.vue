<template>
  <div>
    
  </div>
</template>

<script lang="ts" setup>
import { ref,stop,computed, watch, watchEffect } from 'vue';

let disposables = [];
const count = ref(0);

const doubleCount = computed(()=> count.value * 2);
disposables.push(()=> stop(doubleCount));

const watchCount = watch(()=> count.value, ()=> console.log("watch count", count.value));
disposables.push(watchCount);

const watchEffectCout = watchEffect(()=> console.log('watchEffect count', count.value));
disposables.push(watchEffectCout); 

const watchDoubleCount = watch(()=> doubleCount.value, ()=> console.log("watch doubleCount", doubleCount.value));
disposables.push(watchDoubleCount);

const watchEffectDoubleCount = watchEffect(()=> console.log('watchEffect doubleCount', doubleCount.value));
disposables.push(watchEffectDoubleCount); 

setTimeout(()=>{
  count.value++;
},2000);

setTimeout(()=>{
  disposables.forEach(dispose=> dispose());
  disposables = []
},4000);

setTimeout(()=>{
  count.value++;
}, 60000);
</script>
