const path = require("path");
const { exec } = require("child_process");

const workerProcess01 = exec(`node ${path.resolve(__dirname, "support.js")} 01`, function(error, stdout, stderr){
    if(error){
        console.log(error.stack);
        console.log('Error code: '+error.code);
        console.log('Signal received: '+error.signal);
    }

    console.log("stdout: " + stdout);
    console.log("stderr: " + stderr);
});

workerProcess01.on("exit", function(code){
    console.log("子进程已退出，退出码 " + code);
});


const workerProcess02 = exec(`node ${path.resolve(__dirname, "support.js")} 02`, function(error, stdout, stderr){
    if(error){
        console.log(error.stack);
        console.log('Error code: '+error.code);
        console.log('Signal received: '+error.signal);
    }

    console.log("stdout: " + stdout);
    console.log("stderr: " + stderr);
});

workerProcess02.on("exit", function(code){
    console.log("子进程已退出，退出码 " + code);
});