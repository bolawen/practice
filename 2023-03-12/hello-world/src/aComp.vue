<template>
  <div>
    <h3>A 组件 Header</h3>
    <slot name="body1" :a="a" :b="b" :c="c">body1 插槽默认内容</slot>
    <slot name="body2" :a="a" :b="b" :c="c">body2 插槽默认内容</slot>
    <p>A 组件 Footer</p>
  </div>
</template>

<script>
export default {
  name: "AComp",
  data() {
    return {
      a: 1,
      b: 2,
      c: 3,
    };
  },
};
</script>
