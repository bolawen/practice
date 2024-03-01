import { effect, track, trigger } from './effect';

export function computed(getter) {
  /**
   * @description: 用来存储上一次的计算值
   */
  let value;
  /**
   * @description: 用来表示是否需要重新计算
   * 作用: 通过 value 保存 effectFn() 的结果, 通过 dirty 控制 effectFn 是否执行、重新计算, 从而实现了 computed 的缓存。访问 computed 的值多次, 只会在第一次访问时进行真正的计算, 后续访问都会直接读取缓存的 value 值。
   */
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        /**
         * @description: 在调度器中, 将 dirty 置为 false
         */
        dirty = true;
        /**
         * @description: 当计算属性依赖的响应式数据发生变化时, 手动调用 trigger 函数触发响应
         */
        trigger(obj, null, 'value');
      }
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      /**
       * @description: 当读取计算属性时, 手动调用 track 函数进行追踪
       */
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}
