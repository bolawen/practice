function loader2(sourceCode){
    console.log("loader2");
    return sourceCode + `\n // loader2 处理`;
}

module.exports = loader2;