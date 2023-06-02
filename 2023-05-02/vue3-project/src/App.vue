<template>
  <div class="wrap">
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
    <router-link to="/list">List</router-link>

    <div class="wrap-view">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
body{
  height: 900px;
  overflow-y: auto;
}
</style>