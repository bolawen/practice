const fs = require("fs");
const path = require("path");

function getCharByte(char) {
  const regChinese = /[\u4e00-\u9fa5]/g;
  const regUpperCase = /[A-Z]/g;
  const regLowerCase = /[a-z]/g;
  const upperCaseSpecial = ["M", "W", "G"];
  const lowerCaseSpecial = ["m", "w"];
  const specialLowChar = ["i", "I", "1", "l", "t"];

  if (regChinese.test(char)) {
    return 2;
  } else if (regUpperCase.test(char)) {
    if (upperCaseSpecial.includes(char)) {
      return 2;
    }
    if (specialLowChar.includes(char)) {
      return 1.2;
    }
    return 1.4;
  } else if (regLowerCase.test(char)) {
    if (lowerCaseSpecial.includes(char)) {
      return 1.4;
    }
    if (specialLowChar.includes(char)) {
      return 0.8;
    }
    return 1;
  } else {
    if (specialLowChar.includes(char)) {
      return 0.8;
    }
    return 1;
  }
}
function getLabelByte(str) {
  if (!str) {
    str = "";
  }
  const strList = str.split("");
  return strList.reduce((prev, curr) => {
    return prev + getCharByte(curr);
  }, 0);
}

function sort(array){
    array.sort((a, b) => {
      if (a.sort && b.sort && a.sort < b.sort) {
        return -1;
      }
      const aLabelByte = getLabelByte(a.label);
      const bLabelByte = getLabelByte(b.label);
      if (aLabelByte === bLabelByte) {
        return a.label.localeCompare(b.label);
      }
      return aLabelByte < bLabelByte ? -1 : 1;
    });
}

const array = [
  { type: "doc", id: "npm/package", sort: 10, label: "操作" },
  {
    type: "category",
    label: "脚本",
    collapsible: true,
    collapsed: true,
    sort: 10,
    items: [
      {
        type: "category",
        label: "案例",
        collapsible: true,
        collapsed: true,
        sort: 10,
        items: [
          {
            type: "doc",
            id: "npm/scripts/demo/frontDeployment",
            sort: 10,
            label: "前端部署",
          },
        ],
      },
      {
        type: "doc",
        id: "npm/scripts/readme",
        sort: 0,
        label: "认识",
      },
    ],
  },
  { type: "doc", id: "npm/readme", sort: 1, label: "认识" },
  { type: "doc", id: "npm/problem", sort: 10, label: "问题" },
  {
    type: "category",
    label: "包管理",
    collapsible: true,
    collapsed: true,
    sort: 10,
    items: [
      {
        type: "doc",
        id: "npm/packageManager/rush",
        sort: 10,
        label: "Rush",
      },
      {
        type: "doc",
        id: "npm/packageManager/yarn",
        sort: 10,
        label: "Yarn",
      },
      {
        type: "doc",
        id: "npm/packageManager/pnpm",
        sort: 10,
        label: "PnPm",
      },
      {
        type: "doc",
        id: "npm/packageManager/cnpm",
        sort: 10,
        label: "CNPM",
      },
    ],
  },
  {
    type: "category",
    label: "仓库管理",
    collapsible: true,
    collapsed: true,
    sort: 10,
    items: [
      {
        type: "doc",
        id: "npm/storeManager/lerna",
        sort: 10,
        label: "Lerna",
      },
      {
        type: "doc",
        id: "npm/storeManager/monorepo",
        sort: 10,
        label: "Monorepo",
      },
    ],
  },
  {
    type: "category",
    label: "镜像管理",
    collapsible: true,
    collapsed: true,
    sort: 10,
    items: [
      {
        type: "doc",
        id: "npm/imageManager/yrm",
        sort: 10,
        label: "Yrm",
      },
      {
        type: "doc",
        id: "npm/imageManager/nrm",
        sort: 10,
        label: "NRM",
      },
    ],
  },
];
sort(array);
console.log(array.length)

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
