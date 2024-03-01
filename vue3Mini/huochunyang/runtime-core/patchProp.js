function shouldSetAsProps(el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') {
    return false;
  }
  return key in el;
}

function patchClass(el, value) {
  el.className = value || '';
}

function patchStyle(el, prev, next) {}

function patchEvent(el, key, prevValue, nextValue) {
  const invokers = el._vei || (el._vei = {});
  let invoker = invokers[key];
  const name = key.slice(2).toLowerCase();
  if (nextValue) {
    /**
     * @description:  如果 nextValue 存在 且 没有 invoker ，伪造一个 invoker 并缓存到 el._vei 中
     */
    if (!invoker) {
      invoker = el._vei[key] = e => {
        /**
         * @description: 如果事件发生的时间早于事件处理函数绑定的时间,则不执行事件处理函数
         */
        if (e.timeStamp < invoker.attached) {
          return;
        }

        /**
         * @description: invoker.value 是数组，则遍历 invoker.value 逐个调用事件处理函数
         */
        if (Array.isArray(invoker.value)) {
          invoker.value.forEach(fn => fn(e));
        } else {
          invoker.value(e);
        }
      };
      invoker.value = nextValue;
      /**
       * @description: invoker.attached 存储事件处理函数被绑定的时间
       */
      invoker.attached = performance.now();
      el.addEventListener(name, invoker);
    } else {
      /**
       * @description: 如果 nextValue 存在 且 之前有 invoker， 只需要更新 invoker.value 的值即可
       */
      invoker.value = nextValue;
    }
  } else if (invoker) {
    /**
     * @description: 如果 nextValue 不存在, 且 之前有 invoker, 则移除绑定事件
     */
    el.removeEventListener(name, invoker);
  }
}

export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    patchClass(el, nextValue);
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue);
  } else if (/^on/.test(key)) {
    patchEvent(el, key, prevValue, nextValue);
  } else if (shouldSetAsProps(el, key, nextValue)) {
    // 通过 shouldSetAsProps 判断 key 属性是否是可读属性 或者 存在于 DOM Properties 中
    const type = typeof el[key];
    if (type === 'boolean' && nextValue === '') {
      el[key] = true;
    } else {
      el[key] = nextValue;
    }
  } else {
    // 如果要设置的属性没有对应的 DOM Properties 或者是可读属性， 则使用 setAttribute 来设置属性
    el.setAttribute(key, nextValue);
  }
}
