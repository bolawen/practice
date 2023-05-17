<template>
  <div>
    <a @click="push('/')">Home</a>
    <a @click="push('/about')">About</a>

    <component :is="currentView" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Home from './views/HomeView.vue'
import About from './views/AboutView.vue'

const routes = {
  '/': Home,
  '/about': About
}

const currentPath = ref(window.location.pathname)

const renderView = ()=>{
  currentPath.value = window.location.pathname;
}

const push = (path: string) => {
  const stateObj = {
    a: 1,
    b: 2
  }
  const title = ''
  const url = path
  history.pushState(stateObj, title, url);
  renderView();
}

window.addEventListener('popstate',()=>{
  renderView();
});

const currentView = computed(() => {
  return routes[currentPath.value as keyof typeof routes || '/']
})
</script>
