const os = require("os");
const http = require("http");
const cluster = require("cluster");

if(cluster.isMaster){
    // 主进程: 开启子进程, 子线程数量为 CPU 核心数的一半即可
    const cpuHalfLength = os.cpus().length >>> 1;

    for(let i=0; i<cpuHalfLength; i++){
        const worker = cluster.fork();
        // 对子进程进行心跳检测
        let missedPing = 0;
        let inter = setInterval(()=>{
            worker.send('ping');
            missedPing++;

            // 如果发送了三次消息，子进程没有回复，那么就认为是僵尸进程，杀掉
            if(missedPing >= 3){
                clearInterval(inter);
                process.kill(worker.process.pid)
            }
        }, 5000);

        // 接收子进程的消息
        worker.on('message', msg=>{
            if(msg === 'pong'){
                missedPing--;
            }
        });
    }

    // 主进程监控子进程
    cluster.on("exit", ()=>{
        // 如果子进程一挂掉，我们又重新fork一个，当子进程一直挂掉，我们这里就不断的fork，这样会导致一直占用cpu，最后直接挂掉，所以需要延迟下再fork
        setTimeout(()=>{
            cluster.fork();
        }, 5000);
    });

}else{
    // 子进程: 创建服务
    http.createServer((req, res) => {
        res.writeHead(200);
        res.end("hello world");
        console.log(`进程 ${process.pid} 处理服务中...`);
    }).listen(4000);

    // 子进程: 捕获错误, 并退出进程
    process.on("uncaughtException", (err) => {
        console.log(err);
        process.exit(1);
    });

    process.on("message", msg=>{
        if(msg === 'ping'){
            process.send('pong');
        }
    });

    setInterval(() => {
        if (process.memoryUsage().rss > 534003200) {
            console.log('oom')
            process.exit(1)
        }
    }, 5000)
}