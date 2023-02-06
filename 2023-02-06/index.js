const cloneDeep = require("lodash/cloneDeep");

const obj = {
    name: "柏拉图",
    age: 23
}
const objCopy = cloneDeep(obj);

console.log(objCopy === obj);