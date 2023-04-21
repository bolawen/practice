<template>
  <div>
    {{ this.value.num }}

    <ul>
      <li :key="index" v-for="(item,index) in value.list">{{ item }}</li>
    </ul>

    <button @click="addListItem">HelloWorld 组件 增加 State.List</button>

  </div>
</template>

<script>
export default {
  inject: {
    value: {
      from: "state",
      default: () => {
        return { num: 0, list: [] };
      },
    },
    addNum: {
      from: "addNum"
    },
    addListItem: {
      from : "addListItem"
    }
  },
};
</script>
