import { AsyncParallelHook } from "tapable";

// 初始化 AsyncParallelHook 实例
const asyncParallelHook = new AsyncParallelHook(["arg1", "arg2", "arg3"]);

// 注册 AsyncParallelHook 钩子
asyncParallelHook.tapAsync("asyncParallelHook1", (arg1, arg2, arg3, callback) => {
    console.log("asyncParallelHook1", arg1, arg2, arg3);
    setTimeout(() => {
        callback();
    }, 1000);
});
asyncParallelHook.tapPromise("asyncParallelHook2", (arg1, arg2, arg3) => {
    console.log("asyncParallelHook2", arg1, arg2, arg3);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
});

// 触发 AsyncParallelHook 钩子
console.time("timer");
asyncParallelHook.callAsync("arg1", "arg2", "arg3", () => {
    console.log("全部执行完毕");
    console.timeEnd("timer");
});