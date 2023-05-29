<template>
  <div ref="container" id="container"></div>
</template>

<script setup lang="ts">
import { h, onMounted, ref, render } from "vue";

const container = ref(null);
const VNode = h("div", { class: "container" }, "哈哈");

onMounted(() => {
  console.log(container);
  console.log(VNode);
  render(VNode, container.value);
});
</script>
