// 模拟失败请求
function fetch(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            reject('失败接口');
        },3000);
    });
}

// 记录重试次数
let retries = 0;

function load(onError){
    // 请求接口
    const p = fetch();
    // 捕获错误
    return p.catch(err=>{
        return new Promise((resolve,reject)=>{
            const retry = ()=> { 
                resolve(load(onError));
                retries++;
            };
            const fail = ()=> reject(err);
            onError(retry,fail,retries);
        });
    });
}

// 调用 load 加载资源
load((retry,fail,retries)=>{
    if(retries <= 6){
        console.log(`重试 ${retries} 次`);
        retry();
    }else{
        console.log("重试 6 次之后停止，不再继续请求");
        fail();
    }
}).then(res=>{
    // 请求成功
    console.log(res);
}).catch((error)=>{
    // 请求失败
    console.log(error);
});