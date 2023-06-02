const fs = require("fs");

function getMdConfig(mdPath) {
  const mdData = fs.readFileSync(mdPath, "utf-8");
  const strMdDataObjList = getObject(mdData);
  return transformObject(strMdDataObjList);
}
function getObject(str) {
  const reg1 = /\n/g;
  const reg2 = /(?<=(---)).*?(?=(---))/g;
  const reg3 = /(\w+)\:\s*(?:(\S+))/g;
  const strCopy = str.match(reg1)?.[0] || "";
  const headerContent = strCopy.match(reg2)?.[0] || "";
  console.log("headerContent", headerContent);
  const strContent = reg1.exec(str)?.[1] || "";
  console.log("strContent", strContent);
  return strContent.match(reg2) || [];
}
function transformObject(array) {
  const { length } = array;
  if (!length) {
    return;
  }
  const arrayCopy = array.map((value) => {
    return value.split(":");
  });
  return Object.fromEntries(arrayCopy);
}

const mdData = fs.readFileSync("./a.md", "utf-8");
console.log(mdData)
// getObject(mdData);
const reg1 = /[\n]/g;
console.log(mdData.replace(reg1, "|"));

// 使用正则
let reg = /(?<=(---)).*?(?=(---))/g;
let str = '---|id: write|sort: 1|title: 编写|---';
// 使用
console.log(str.match(reg)); // 输出 ['1234']