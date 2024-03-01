import { createApp, App as AppInstance } from 'vue';
import {
  createRouter,
  createWebHashHistory,
  RouterHistory,
  Router
} from 'vue-router';
import App from './App.vue';
import routes from './router';

declare global {
  interface Window {
    eventCenterForAppNameVite: any;
    __MICRO_APP_NAME__: string;
    __MICRO_APP_ENVIRONMENT__: string;
    __MICRO_APP_BASE_APPLICATION__: string;
  }
}

let app: AppInstance | null = null;
let router: Router | null = null;
let history: RouterHistory | null = null;
// 将渲染操作放入 mount 函数
function mount() {
  history = createWebHashHistory();
  router = createRouter({
    history,
    routes
  });

  app = createApp(App);
  app.use(router);
  app.mount('#vite-vue3-micro');

  console.log('微应用child-vite渲染了');
}

// 将卸载操作放入 unmount 函数
function unmount() {
  app?.unmount();
  history?.destroy();
  // 卸载所有数据监听函数
  window.eventCenterForAppNameVite?.clearDataListener();
  app = null;
  router = null;
  history = null;
  console.log('微应用child-vite卸载了');
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_BASE_APPLICATION__) {
  // @ts-ignore
  window['vite-vue3-micro'] = { mount, unmount };
} else {
  // 非微前端环境直接渲染
  mount();
}
