<template>
  <div class="tree">
    <div class="tree-list">
      <div class="tree-item" v-for="(item, index) in data">
        <TreeItem
          :data="item"
          :index="index"
          :level="level"
          :isLastChild="index === data.length - 1"
        ></TreeItem>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TreeItem from './TreeItem.vue';

const props = defineProps({
  data: Array,
  level: Number,
});

const level = computed(() => {
  return props.level || 1;
});
</script>
