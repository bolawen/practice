const app = new Vue({
    data() {
      return {
        message: "Hello World",
      };
    },
    mounted(){
      this.message = "Hello World 修改"
    }
  }).$mount("#app");