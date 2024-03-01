import { AsyncSeriesHook } from 'tapable';

// 初始化 AsyncSeriesHook 钩子
const asyncSeriesHook = new AsyncSeriesHook(['arg1', 'arg2', 'arg3']);

// 注册 AsyncSeriesHook 钩子
asyncSeriesHook.tapAsync('asyncSeriesHook1', (arg1, arg2, arg3, callback) => {
  console.log('asyncSeriesHook1', arg1, arg2, arg3);
  setTimeout(() => {
    // 调用 callback 表示当前注册的函数执行完毕
    callback();
  }, 1000);
});

asyncSeriesHook.tapPromise('asyncSeriesHook2', (arg1, arg2, arg3) => {
  console.log('asyncSeriesHook2', arg1, arg2, arg3);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
});

asyncSeriesHook.tapAsync('asyncSeriesHook3', (arg1, arg2, arg3, callback) => {
  console.log('asyncSeriesHook3', arg1, arg2, arg3);
  setTimeout(() => {
    //  callback 函数调用时, 第一个参数表示错误对象，如果传递第一个参数的话那么就表示本次执行出现错误会中断执行
    callback('error');
  }, 1000);
});

asyncSeriesHook.tapPromise('asyncSeriesHook4', (arg1, arg2, arg3) => {
  console.log('asyncSeriesHook4', arg1, arg2, arg3);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 如果 Promise 返回的结果是 reject 状态，那么和 callback 传递错误参数同样效果，也会中断后续的执行
      reject('error');
    }, 2000);
  });
});

asyncSeriesHook.tapAsync('asyncSeriesHook5', (arg1, arg2, arg3, callback) => {
  console.log('asyncSeriesHook5', arg1, arg2, arg3);
  setTimeout(() => {
    callback();
  }, 1000);
});

// 触发 AsyncSeriesHook 钩子
console.time('timer');
asyncSeriesHook.callAsync('1', '2', '3', () => {
  console.log('全部执行完毕');
  console.timeEnd('timer');
});
