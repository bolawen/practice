<template>
  <div>
    <h3>B 组件</h3>
    {{ $root.theme }}
    <button @click="$root.setTheme('香槟金')">孙组件 改变 root theme</button>
  </div>
</template>
<script>
export default {
  mounted(){
    console.log(this.$root)
  }
};
</script>
