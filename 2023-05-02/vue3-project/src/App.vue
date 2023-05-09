<template>
  <div>
    <ul>
      <li :key="item.id" v-for="item in list" :ref="(el) => setListItemRef(el, item.id)">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const list = ref([
  {
    id: 1,
    name: '哈哈'
  },
  {
    id: 2,
    name: '嘻嘻'
  },
  {
    id: 3,
    name: '呵呵'
  }
])

const listItemRef = ref<{ [key: number]: any }[]>([])

const setListItemRef = (dom: any, id: number) => {
  listItemRef.value.push({ [id]: dom })
  console.log(listItemRef)
}
</script>
