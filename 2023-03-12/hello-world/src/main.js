import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

Vue.component("AComponent", () => ({
  component: import("./components/A.vue"),
  loading: "加载中",
  error: "加载失败",
  delay: 200,
  timeout: 3000,
}));

new Vue({
  render: (h) => h(App),
}).$mount("#app");
