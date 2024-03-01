import { AsyncParallelBailHook } from 'tapable';

// 初始化 AsyncParallelBailHook 实例
const asyncParallelBailHook = new AsyncParallelBailHook([
  'arg1',
  'arg2',
  'arg3'
]);

// 注册 AsyncParallelBailHook 钩子
asyncParallelBailHook.tapAsync(
  'asyncParallelBailHook1',
  (arg1, arg2, arg3, callback) => {
    console.log('asyncParallelBailHook1', arg1, arg2, arg3);
    setTimeout(() => {
      callback(null, true);
    }, 1000);
  }
);
asyncParallelBailHook.tapPromise(
  'asyncParallelBailHook2',
  (arg1, arg2, arg3) => {
    console.log('asyncParallelBailHook2', arg1, arg2, arg3);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }
);

// 触发 AsyncParallelBailHook 钩子
console.time('timer');
asyncParallelBailHook.callAsync('arg1', 'arg2', 'arg3', () => {
  console.log('全部执行完毕');
  console.timeEnd('timer');
});