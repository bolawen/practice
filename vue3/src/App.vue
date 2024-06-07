<template>
  <div>
    <Tree :data="data" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Tree from "./components/Tree1/tree";

const data = ref<any[]>([
  {
    id: 1,
    pid: 0,
    label: "1",
    children: [
      {
        id: 11,
        pid: 1,
        label: "1-1",
        children: [
          {
            id: 111,
            pid: 11,
            label: "1-1-1",
          },
          {
            id: 112,
            pid: 11,
            label: "1-1-2",
          },
        ],
      },
      {
        id: 12,
        pid: 1,
        label: "1-2",
        children: [
          {
            id: 121,
            pid: 12,
            label: "1-2-1",
          },
          {
            id: 122,
            pid: 12,
            label: "1-2-2",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    pid: 0,
    label: "2",
    children: [
      {
        id: 21,
        pid: 2,
        label: "2-1",
        children: [
          {
            id: 211,
            pid: 21,
            label: "2-1-1",
          },
          {
            id: 212,
            pid: 21,
            label: "2-1-2",
            children: [
              {
                id: 2121,
                pid: 212,
                label: "2-1-2-1",
              },
              {
                id: 2122,
                pid: 212,
                label: "2-1-2-2",
              },
            ],
          },
        ],
      },
      {
        id: 22,
        pid: 2,
        label: "2-2",
        children: [
          {
            id: 221,
            pid: 22,
            label: "2-2-1",
          },
          {
            id: 222,
            pid: 22,
            label: "2-2-2",
          },
        ],
      },
    ],
  },
]);
</script>
