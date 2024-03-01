function loader1(sourceCode){
    console.log("loader1");
    return sourceCode + `\n // loader1 处理`;
}

module.exports = loader1;