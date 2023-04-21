<template>
  <div>
    <HelloWorld></HelloWorld>
    <button @click="addNum">App 组件 增加 State.Num</button>
    <button @click="addListItem">App 组件 增加 State.List</button>
  </div>
</template>

<script>
import HelloWorld from "./HelloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      state: {
        num: 0,
        list: [],
      },
    };
  },
  provide() {
    return {
      state: this.state,
      addNum: this.addNum,
      addListItem: this.addListItem
    };
  },
  methods: {
    addNum() {
      this.state.num = this.state.num + 1;
    },
    addListItem(){
      const item = this.state.num;
      this.state.list.push(item)
    }
  },
};
</script>
