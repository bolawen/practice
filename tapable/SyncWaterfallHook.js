import { SyncWaterfallHook } from "tapable";

// 初始化 SyncWaterfallHook 钩子
const syncWaterfallHook = new SyncWaterfallHook(['arg1','arg2','arg3']);

// 注册 SyncWaterfallHook 钩子
syncWaterfallHook.tap('syncWaterfallHook1',(arg1,arg2,arg3)=>{
    console.log('syncWaterfallHook1',arg1,arg2,arg3);
    return 1;
});
syncWaterfallHook.tap('syncWaterfallHook2',(arg1,arg2,arg3)=>{
    console.log('syncWaterfallHook2',arg1,arg2,arg3);
    return 2;
});
syncWaterfallHook.tap('syncWaterfallHook3',(arg1,arg2,arg3)=>{
    console.log('syncWaterfallHook3',arg1,arg2,arg3);
});

// 触发 SyncWaterfallHook 钩子
setTimeout(()=>{
    syncWaterfallHook.call(1,2,3);
});