import { effect } from './effect';

/**
 * @description: 递归读取 source
 */

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value == null || seen.has(value)) {
    return;
  }
  seen.add(value);
  for (const k in value) {
    traverse(value[k], seen);
  }
  return value;
}

export function watch(source, cb, options = {}) {
  let getter;

  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }

  let oldValue, newValue;
  /**
   * @description: cleanup 用来存储用户注册的过期回调
   * 作用: 通过 cleanup 存储用户注册的过期回调, 每当 watch 回调函数执行之前, 会优先执行用户通过 onInvalidate 注册的过期回调。 这样, 用户就有机会在过期回调中将上一次的副作用标记为 过期, 从而以 忽略请求数据的方式 解决竞态问题。
   */
  let cleanup;

  function onInvalidate(fn) {
    cleanup = fn;
  }
  /**
   * @description: 将 scheduler 调度函数作为一个独立的 job 函数
   */
  const job = () => {
    newValue = effectFn();
    if (cleanup) {
      cleanup();
    }
    cb(newValue, oldValue, onInvalidate);
    oldValue = newValue;
  };

  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      /**
       * @description: options.flush 指定 调度函数 执行时机
       * @param {*} options
       * flush: 'post': 将 job 函数放到微任务队列中执行
       */
      if (options.flush === 'post') {
        const p = Promise.resolve();
        p.then(job);
      } else {
        job();
      }
    }
  });

  /**
   * @description: options.immediate 指定 调度函数 立即执行
   * @param {*} options
   */
  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}
