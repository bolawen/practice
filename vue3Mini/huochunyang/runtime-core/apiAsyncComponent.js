export function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = {
      loader: options
    };
  }

  const { loader } = options;
  let innerComp = null;
  // 记录重试次数
  let retries = 0;

  function load() {
    return loader().catch(err => {
      if (options.onError) {
        // 如果用户指定了 onError 回调, 则将控制权交给用户
        return new Promise((resolve, reject) => {
          const retry = () => {
            resolve(load());
            retries++;
          };
          const fail = () => reject(err);
          options.onError(retry, fail, retries);
        });
      } else {
        throw err;
      }
    });
  }

  return {
    name: 'AsyncComponentWrapper',
    setup() {
      // loaded : 记录异步组件是否加载成功
      const loaded = ref(false);
      // error : 用来存储错误对象
      const error = shallowRef(null);
      // loading: 一个标志, 用来表示是否正在加载
      const loading = ref(false);
      let loadingTimer = null;

      if (options.delay) {
        loadingTimer = setTimeout(() => {
          // 如果 options.delay 配置, 则开启一个定时器, 延迟将 loading.value 设置为 true
          loading.value = true;
        }, options.delay);
      } else {
        // 如果 options.delay 没有配置, 则直接将 loading.value 设置为 true
        loading.value = true;
      }

      // 执行 loader 加载器
      load()
        .then(c => {
          innerComp = c;
          loaded.value = true;
        })
        .catch(err => {
          error.value = err;
        })
        .finally(() => {
          loading.value = false;
          // 加载完毕后, 无论成功与否都要清除延迟定时器
          clearTimeout(loadingTimer);
        });

      // 开始加载组件的同时, 开启一个定时器进行计时。当加载超时后，将 timeout.value 的值设置为 true ，代表加载已经超时。当组件被卸载时，需要清楚定时器。
      let timer = null;
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(
            `Async Component timed out after ${options.timeout}ms`
          );
          error.value = err;
        }, options.timeout);
      }

      onUnmounted(() => {
        clearTimeout(timer);
      });

      const placeholder = { type: Text, children: '' };

      return () => {
        if (loaded.value) {
          // 如果 loaded 变量有值, 表示异步组件加载成功, 则渲染被加载的组件
          return { type: InnerComp };
        } else if (error.value && options.errorComponent) {
          // 如果 timeout 变量有值, 表示异步组件加载超时, 如果用户指定了 Error 组件, 则渲染 Error 组件
          return {
            type: options.errorComponent,
            props: { error: error.value }
          };
        } else if (loading.value && options.loadingComponent) {
          // 如果 loading.value 为 true 且 用户设置了 loading 组件, 则渲染 loading 组件
          return { type: options.loadingComponent };
        } else {
          return placeholder;
        }
      };
    }
  };
}
