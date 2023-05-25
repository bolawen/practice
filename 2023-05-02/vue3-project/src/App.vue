<template>
  <div class="wrap">
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
    <router-link to="/home">Home</router-link>
    <router-link to="/home1">Home 1</router-link>

    <button @click="jump">关于</button>

    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'">
        <component :key="route.path" :is="Component"></component>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const jump = ()=>{
  router.replace({ name: 'about', params: { a: 1}});
}
</script>

<style scoped>
.wrap {
  width: 400px;
  height: 600px;
  overflow: hidden;
  position: relative;
  margin-top: 24px;
}

/**
 * @description: slide-left
 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s ease-out;
}

.slide-left-enter {
  position: absolute;
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  position: absolute;
  transform: translateX(100%);
  opacity: 0;
}

/**
 * @description: slide-right
 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease-out;
}

.slide-right-enter {
  position: absolute;
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  position: absolute;
  transform: translateX(-100%);
  opacity: 0;
}
</style>