import { parse } from "../dist/index.js"

const code = "let a = function() {};"
const program = parse(code);
console.log('program', program);