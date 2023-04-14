<template>
  <div>
    <button v-on:click="event">点击</button>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      event: "handleClick"
    };
  },
  methods: {
    handleClick($event) {
      console.log($event);
    },
  },
};
</script>
