<template>
    <div class="wrap">
      <h1>详情页</h1>

      <h3>id为: {{ id }}</h3>
    </div>
  </template>
  
  <script setup lang="ts">
import { useRoute } from 'vue-router';

  const route = useRoute();
  const id = route.params.id;
  </script>