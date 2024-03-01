import { App } from 'vue';

export default {
  install(app: App<Element>, _options: any) {
    app.directive('throttle', {
      created(el, binding) {
        let wait = binding.value || 3000;
        let previous = 0;

        el.addEventListener('click', (event: any) => {
          let now = +new Date();
          if (now - previous > wait) {
            previous = now;
          } else {
            event && event.stopImmediatePropagation();
          }
        });
      }
    });
  }
};
