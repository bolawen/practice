import { SyncLoopHook } from "tapable";

let flag1 = 2;
let flag2 = 1;

// 初始化 SyncLoopHook 钩子
const syncLoopHook = new SyncLoopHook(['arg1','arg2','arg3']);

// 注册 SyncLoopHook 钩子
syncLoopHook.tap('syncLoopHook1',(arg1,arg2,arg3)=>{
    console.log('syncLoopHook1',arg1,arg2,arg3);
    if(flag1 !== 3){
        return flag1++;
    }
});
syncLoopHook.tap('syncLoopHook2',(arg1,arg2,arg3)=>{
    console.log('syncLoopHook2',arg1,arg2,arg3);
    if(flag2 !== 3){
        return flag2++;
    }
});

// 触发 SyncLoopHook 钩子
setTimeout(()=>{
    syncLoopHook.call(1,2,3);
});