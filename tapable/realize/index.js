import SyncHook from './SyncHook.js';

// 初始化 syncHook 钩子
const syncHook = new SyncHook(['arg1', 'arg2', 'arg3']);

// 注册 syncHook 钩子
syncHook.tap('syncHook1', (arg1, arg2, arg3) => {
  console.log('syncHook1', arg1, arg2, arg3);
});

syncHook.tap('syncHook2', (arg1, arg2, arg3) => {
  console.log('syncHook2', arg1, arg2, arg3);
});

// 触发 syncHook 钩子
setTimeout(() => {
  syncHook.call(1, 2, 3);
}, 3000);

