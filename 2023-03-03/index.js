const crypto = require("crypto");

function getRandom(min, max) {
  return crypto.randomInt(min,max+1)
}
console.log(getRandom(2, 4));
