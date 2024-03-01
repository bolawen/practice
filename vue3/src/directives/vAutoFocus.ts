import { App } from 'vue';

const vAutoFocus = {
  install(app: App<Element>, _options: any) {
    app.directive('autoFocus', {
      mounted: el => {
        return el.focus();
      }
    });
  }
};

export default vAutoFocus;
