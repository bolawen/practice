<template>
  <div>
    <h3>第一步</h3>
    <input v-model="str" />
  </div>
</template>
<script>
export default {
  name: "Setp-1",
  data() {
    return {
      str: "",
    };
  }
};
</script>
