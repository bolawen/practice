import { SyncBailHook } from "tapable"

// 初始化 SyncBailHook 钩子
const syncBailHook = new SyncBailHook(['arg1','arg2','arg3']);


// 注册 SyncBailHook 钩子
syncBailHook.tap('syncBailHook1',(arg1,arg2,arg3)=>{
    console.log('syncBailHook1',arg1,arg2,arg3);
});
syncBailHook.tap('syncBailHook2',(arg1,arg2,arg3)=>{
    console.log('syncBailHook2',arg1,arg2,arg3);
    // 存在返回值，后续的钩子不再执行
    return true;
});
syncBailHook.tap('syncBailHook3',(arg1,arg2,arg3)=>{
    console.log('syncBailHook3',arg1,arg2,arg3);
});

// 触发 SyncBailHook 钩子
setTimeout(()=>{
    syncBailHook.call(1,2,3);
},3000);