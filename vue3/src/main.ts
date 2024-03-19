import App from "./App.vue";
import { createApp } from "vue";
import { createPinia } from "./pinia/createPinia";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.mount("#app");
