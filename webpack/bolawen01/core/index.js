const webpack = require('./webpack.js');
const config = require('../example/webpack.config.js');

const compiler = webpack(config);

// 调用 compiler.run 启动编译
compiler.run((err,stats)=>{
    if(err){
        console.log(err, 'err');
    }
});