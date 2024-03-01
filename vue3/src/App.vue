<template>
  <div>
    <Tree :treeData="treeData" />
  </div>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import Tree from './components/RcTree/Tree';

const treeData = shallowRef([
  {
    title: '0-0-title',
    key: '001',
    children: [
      {
        title: '0-0-0-title',
        key: '002',
        children: [
          { title: '0-0-0-0-title', key: '003' },
          { title: '0-0-0-1-title', key: '004' },
          { title: '0-0-0-2-title', key: '005' }
        ]
      },
      {
        title: '0-0-1-title',
        key: '006',
        children: [
          { title: '0-0-1-0-title', key: '007' },
          { title: '0-0-1-1-title', key: '008' },
          { title: '0-0-1-2-title', key: '009' }
        ]
      },
      {
        title: '0-0-2-title',
        key: '010'
      }
    ]
  },
  {
    title: '0-1-title',
    key: '011',
    children: [
      { title: '0-1-0-0', key: '012' },
      { title: '0-1-0-1', key: '013' },
      { title: '0-1-0-2', key: '014' }
    ]
  },
  {
    title: '0-2-title',
    key: '015'
  }
]);
</script>
