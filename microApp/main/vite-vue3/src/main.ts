import App from './App.vue';
import { createApp } from 'vue';
import microApp from '@micro-zoe/micro-app';

microApp.start({
  plugins: {
    modules: {
      'vite-vue3-micro': [
        {
          loader(code) {
            if (process.env.NODE_ENV === 'development') {
              code = code.replace(
                /(from|import)(\s*['"])(\/vite-vue3-micro\/)/g,
                all => {
                  return all.replace(
                    '/vite-vue3-micro/',
                    'http://localhost:4007/vite-vue3-micro/'
                  );
                }
              );
            }

            return code;
          }
        }
      ]
    }
  }
});

const app = createApp(App);
app.mount('#app');
