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

function sortCategoryAndDocs(array) {
  array.sort((a, b) => {
    if (a.sort && b.sort && a.sort !== b.sort) {
      return a.sort < b.sort ? -1 : 1;
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
  {
    type: "category",
    label: "镜像管理",
    collapsible: true,
    collapsed: true,
    items: [[Object], [Object]],
    sort: 10,
  },
  { type: "doc", id: "npm/package", sort: 10, label: "操作" },
  {
    type: "category",
    label: "包管理",
    collapsible: true,
    collapsed: true,
    items: [[Object], [Object], [Object], [Object]],
    sort: 10,
  },
  { type: "doc", id: "npm/problem", sort: 10, label: "问题" },
  { type: "doc", id: "npm/readme", sort: 1, label: "认识" },
  {
    type: "category",
    label: "脚本",
    collapsible: true,
    collapsed: true,
    items: [[Object], [Object]],
    sort: 10,
  },
  {
    type: "category",
    label: "仓库管理",
    collapsible: true,
    collapsed: true,
    items: [[Object], [Object]],
    sort: 10,
  },
];

sortCategoryAndDocs(array);

sortCategoryAndDocs(array);

console.log(array);
