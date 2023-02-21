const fs = require("fs");
const path = require("path");

function getCharByte(char){
    const regChinese = /[\u4e00-\u9fa5]/g;
    const regUpperCase = /[A-Z]/g;
    const regLowerCase = /[a-z]/g;
    const upperCaseSpecial = ["M","W"];
    const lowerCaseSpecial = ['m','w'];
    const specialLowChar = ["i","I","1"];

    if(regChinese.test(char)){
        return 2;
    }else if(regUpperCase.test(char)){
        if(upperCaseSpecial.includes(char)){
            return 1.8
        }
        if(specialLowChar.includes(char)){
            return 1.4
        }
        return 1.6;
    }else if(regLowerCase.test(char)){
        if(lowerCaseSpecial.includes(char)){
            return 1.4;
        }
        if(specialLowChar.includes(char)){
            return 0.8;
        }
        return 1;
    }else{
        if(specialLowChar.includes(char)){
            return 0.8;
        }
        return 1;
    }
}
function getLabelByte(str){
    if(!str){
        str = "";
    }
    const strList = str.split("");
    return strList.reduce((prev,curr)=>{
        return prev + getCharByte(curr);
    },0);
}
function sort(array){
    array.sort((a,b)=>{
        if(a.sort && b.sort && a.sort < b.sort){
            return -1;
        }
        const aLabelByte = getLabelByte(a.label);
        const bLabelByte = getLabelByte(b.label);
        if(aLabelByte === bLabelByte){
            return a.label.localeCompare(b.label)
        }
        return aLabelByte < bLabelByte ? -1 : 1;
    });
}

const array = [
    {
      "type": "doc",
      "id": "article/git/operation/actions",
      "label": "调试",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/github",
      "label": "配置",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/merge-commit",
      "label": " Git Merge Commit",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/pages",
      "label": " Git Pages",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/pull",
      "label": " Git Pull",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/push",
      "label": " Git Push",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/ssh",
      "label": " Git SSH Key",
      "sort": 10
    },
    {
      "type": "doc",
      "id": "article/git/operation/webhooks",
      "label": " Git WebHooks",
      "sort": 10
    }
  ]
sort(array);
console.log(array)

function getMdContent(filePath) {
    return fs.readFileSync(filePath, "utf-8");
}

function getMdHeaderContentList(str) {
    const reg1 = /\n/g;
    const reg2 = /(?<=(---)).*?(?=(---))/g;
    const reg3 = /(\w+)\:\s*(?:([^\|]+))/g;
    const strCopy = str.replace(reg1, "|");
    console.log(strCopy)
    const headerContent = strCopy.match(reg2)?.[0] || "";
    console.log(headerContent)
    return headerContent.match(reg3) || [];
  }
  function transformListToObject(array) {
    const { length } = array;
    if (!length) {
      return;
    }
    const arrayCopy = array.map((value) => {
      return value.split(":");
    });
    return Object.fromEntries(arrayCopy);
  }
const str = getMdContent("/Users/zhangwenqiang/bolawen/practice/test.md");
const result = getMdHeaderContentList(str);
const obj = transformListToObject(result)
console.log(result);
console.log(JSON.stringify(obj))
