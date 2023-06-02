const app = new Vue({
  data() {
    return {
      message: "Hello World",
    };
  },
  render(createElement){
    return createElement("div",{
        attrs: {
            class: "hello word 1"   
        }
    },this.message)
  },
  mounted() {
    this.message = "hello world 修改"
    console.log(this.message);
    console.log(this._data.message)
  },
}).$mount("#app");