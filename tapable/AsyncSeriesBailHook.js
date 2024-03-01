import { AsyncSeriesBailHook } from 'tapable';

// 初始化 AsyncSeriesBailHook 实例
const asyncSeriesBailHook = new AsyncSeriesBailHook(['arg1', 'arg2', 'arg3']);

// 注册 AsyncSeriesBailHook 钩子
asyncSeriesBailHook.tapAsync(
  'asyncSeriesBailHook1',
  (arg1, arg2, arg3, callback) => {
    console.log('asyncSeriesBailHook1', arg1, arg2, arg3);
    setTimeout(() => {
      // callback 第一个参数表示错误信息, 为null表示没有错误; 第二个参数表示 callback 的返回值
      // 存在返回值 bail 保险打开 中断后续执行
      callback(null,true);
    }, 1000);
  }
);
asyncSeriesBailHook.tapPromise('asyncSeriesBailHook2', (arg1, arg2, arg3) => {
  console.log('asyncSeriesBailHook2', arg1, arg2, arg3);
  return new Promise(resolve => {
    setTimeout(() => {
      // resolve函数存在任何值表示存在返回值
      // 存在返回值 bail 保险打开 中断后续执行
      resolve(true);
    }, 2000);
  });
});
asyncSeriesBailHook.tapAsync(
  'asyncSeriesBailHook3',
  (arg1, arg2, arg3, callback) => {
    console.log('asyncSeriesBailHook3', arg1, arg2, arg3);
    setTimeout(() => {
      callback();
    }, 3000);
  }
);

// 触发 AsyncSeriesBailHook 钩子
console.time('timer');
asyncSeriesBailHook.callAsync('arg1', 'arg2', 'arg3', () => {
  console.log('全部执行完毕');
  console.timeEnd('timer');
});
