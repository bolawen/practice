import Vue from "vue";

const app = new Vue({
  el: "#app",
  data() {
    return {
      message: "Hello World",
    };
  },
  mounted() {
    console.log(this.message);
  },
}).$mount();

console.log(app)