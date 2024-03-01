import { AsyncSeriesWaterfallHook } from 'tapable';

// 初始化 AsyncSeriesWaterfallHook 实例
const asyncSeriesWaterfallHook = new AsyncSeriesWaterfallHook([
  'arg1',
  'arg2',
  'arg3'
]);

// 注册 AsyncSeriesWaterfallHook 钩子
asyncSeriesWaterfallHook.tapAsync(
  'asyncSeriesWaterfallHook1',
  (arg1, arg2, arg3, callback) => {
    console.log('asyncSeriesWaterfallHook1', arg1, arg2, arg3);
    setTimeout(() => {
      callback(null, 1);
    }, 1000);
  }
);

asyncSeriesWaterfallHook.tapPromise(
  'asyncSeriesWaterfallHook2',
  (arg1, arg2, arg3) => {
    console.log('asyncSeriesWaterfallHook2', arg1, arg2, arg3);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, 2000);
    });
  }
);

asyncSeriesWaterfallHook.tapAsync(
  'asyncSeriesWaterfallHook3',
  (arg1, arg2, arg3, callback) => {
    console.log('asyncSeriesWaterfallHook3', arg1, arg2, arg3);
    setTimeout(() => {
      callback();
    }, 3000);
  }
);

// 触发 AsyncSeriesWaterfallHook 钩子
console.time('timer');
asyncSeriesWaterfallHook.callAsync(1, 2, 2, () => {
  console.log('全部执行完毕');
  console.timeEnd('timer');
});
