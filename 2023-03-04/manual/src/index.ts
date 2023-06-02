import "./index.scss";
import $ from "jquery";
import { getName } from "util/index";
import { getName1 } from "util/index1";
import cloneDeep from "lodash/cloneDeep";
import underscore from "underscore";

const test = () => {
  return process.env.NODE_ENV;
};

const envStr = test();
console.log(envStr);

const nameStr = getName();
console.log(nameStr);
const nameStr1 = getName1();
console.log(nameStr1);

const promiseFunc = () => {
  return new Promise((resolve, reject) => {
    resolve(100);
  });
};

const asyncFunc = async () => {
  const result = await promiseFunc();
  console.log(result);
};

asyncFunc();

const data = {
  name: "dataName",
};

const dataCopy = cloneDeep(data);
dataCopy.name = "dataCopyName";

console.log(data);
console.log(dataCopy);

const dataCopy1 = underscore.clone(data);
dataCopy1.name = "dataCopy1Name";
console.log(data);
console.log(dataCopy1);

console.log($(".box"));

console.log(1223);
console.log(245)