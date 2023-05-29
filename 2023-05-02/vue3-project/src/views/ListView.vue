<template>
  <div>
    <h1>列表页</h1>

    <ul>
      <li v-for="item in list" :key="item.id" @click="goDetail(item.id)">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const list = ref([
  {
    id: 1,
    name: '嘻嘻'
  },
  {
    id: 2,
    name: '哈哈'
  },
  {
    id: 3,
    name: '呵呵'
  },
  {
    id: 4,
    name: '嘻嘻'
  },
  {
    id: 5,
    name: '剑姬'
  },
  {
    id: 6,
    name: '剑圣'
  },
  {
    id: 7,
    name: '亚索'
  },
  {
    id: 9,
    name: '妖姬'
  },
  {
    id: 10,
    name: '薇恩'
  }
])

const goDetail = (id) => {
  router.push({ path: `/detail/${id}` })
}
</script>


<style scoped>
li{
    width: 100%;
    height: 300px;
}
</style>