const fs = require("fs");
const path = require("path");


function blue (str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
  }
  
function createFileName() {
  const date = new Date();
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = month > 9 ? month : "0" + month;
  day = day > 9 ? day : "0" + day;
  return year + "-" + month + "-" + day;
}

const fileName = createFileName();
const filePath = path.resolve(__dirname, "../", fileName);

try {
  fs.mkdirSync(filePath);
  console.log(blue("目录创建成功！"));
} catch (error) {
  console.log(blue("目录创建成功！"));
}
