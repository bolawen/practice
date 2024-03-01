import { App } from 'vue';

export const ImageLazyLoad = {
  install(app: App<Element>, _options: any) {
    let defaultSrc = _options.default;
    app.directive('imageLazyLoad', {
      beforeMount(el, binding) {
        ImageLazyLoad.init(el, binding.value, defaultSrc);
      },
      mounted(el) {
        if ('IntersectionObserver' in window) {
          ImageLazyLoad.observer(el);
        } else {
          ImageLazyLoad.listenerScroll(el);
        }
      }
    });
  },
  init(el: any, value: string, defaultValue: string) {
    el.setAttribute('data-src', value);
    el.setAttribute('src', defaultValue);
  },
  observer(el: any) {
    let intersectionObserver = new IntersectionObserver(entries => {
      let realSrc = el.dataset.src;
      if (entries[0].isIntersecting && realSrc) {
        el.src = realSrc;
        el.removeAttribute('data-src');
      }
    });
    intersectionObserver.observe(el);
  },
  listenerScroll(el: any) {
    const handler = ImageLazyLoad.throttle(ImageLazyLoad.load, 200);
    ImageLazyLoad.load(el);
    window.addEventListener('scroll', () => {
      handler(el);
    });
  },
  load(el: any) {
    const realSrc = el.dataset.src;
    let bodyHeight = document.documentElement.clientHeight;
    let { top, bottom } = el.getBoundingClientRect();
    if (top - bodyHeight < 0 && bottom > 0 && el.realSrc) {
      el.src = realSrc;
      el.removeAttribute('data-src');
    }
  },
  throttle(fn: any, wait: number) {
    let timer: any = null;
    let previous: number = 0;

    return function (...args: any[]) {
      const context = this;
      let now = +new Date();

      if (now - previous < wait) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          previous = now;
          fn.apply(context, args);
        }, wait);
      } else {
        previous = now;
        fn.apply(context, args);
      }
    };
  }
};
