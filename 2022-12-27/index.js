function isInChinese(str) {
  const reg = /[\u4e00-\u9fa5]/;
  return reg.test(str);
}

function isAllChinese(str) {
  const reg = /^[\u4e00-\u9fa5]$/;
  return reg.test(str);
}

function extractChinese(str){
    const reg = /[\u4e00-\u9fa5]/g;
    return str.match(reg);
}

const str = "a发b";
console.log(isInChinese(str));
console.log(isAllChinese(str));
console.log(extractChinese(str))
