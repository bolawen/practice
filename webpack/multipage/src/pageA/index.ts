import { deepClone } from "../common/a";

const a = {
  a: 1,
  b: 2,
};

const b = deepClone(a);
console.log(b);

import(/* webpackChunkName: "PageA" */ "../common/b").then(
  ({ getRandomColor }) => {
    console.log(getRandomColor());
  }
);

import(/* webpackChunkName: "PageA" */ "../common/c").then(({ maxProfit }) => {
  console.log(maxProfit([1, 2, 3]));
});
