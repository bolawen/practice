import { test } from "../common/e";
import { multiply, deepClone } from "../common/a";

const a = {
  a: 1,
  b: 2,
};

const b = deepClone(a);
console.log(b);

const result = multiply(2, 3);
console.log(result);

console.log(test());

import(/* webpackChunkName: "PageA/hello" */ "./hello").then(
  ({ printHello }) => {
    printHello();
  }
);

import(/* webpackChunkName: "PageA/word" */ "./word").then(({ printWord }) => {
  printWord("word");
});


// @if mode='development'
console.log("development");
// @endif

// @if mode='production'
console.log("production");
// @endif


define("require", "exports", "./hello", function(require, exports, fetch_1){
  console.log("fetch_1", fetch_1);
  fetch_1.printHello();
});

(function commonJS(require, module) {
  'use strict';
  
  require('./hello');
  
  module.exports = '720kb.tooltips';
  }(require, module));