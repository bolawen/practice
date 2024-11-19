import { cloneDeep } from "lodash";

const a = { a: 1, b: 2 };
const b = cloneDeep(a);
console.log(b);
console.log(a);
