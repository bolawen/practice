import { createApp } from 'vue'
import App from './App.vue'
import cn from "./lang/cn.json"
import en from "./lang/en.json"
import i18nPlugin from './plugins/i18n-plugin'

const lang = 'cn';
const langMap = {
    cn,
    en
}
const app = createApp(App)
app.use(i18nPlugin,langMap[lang]);
app.mount('#app')
