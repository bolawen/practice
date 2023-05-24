<template>
  <div>
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
    <router-link to="/home">Home</router-link>
    <router-link to="/home1">Home 1</router-link>

    <button @click="jump">关于</button>

    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const jump = ()=>{
  router.replace({ name: 'about', params: { a: 1}});
}
</script>
