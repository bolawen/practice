import { App } from 'vue';

const vCopy = {
  install(app: App<Element>, _options: any) {
    app.directive('copy', {
      mounted: (el: any, binding: any) => {
        el.$value = binding.value || el.innerText;
        el.handler = () => {
          if (!el.$value) {
            console.log('无复制内容');
            return;
          }
          const textarea: any = document.createElement('textarea');
          textarea.readOnly = 'readonly';
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          textarea.value = el.$value;
          document.body.appendChild(textarea);
          textarea.select();
          const result = document.execCommand('Copy');
          if (result) {
            console.log('复制成功！');
          }
          document.body.removeChild(textarea);
        };
        el.addEventListener('click', el.handler);
      },
      updated: (el: any, binding: any) => {
        el.$value = binding.value;
      }
    });
  }
};

export default vCopy;
