// function getRandomInt(min, max) {
//   const max_range = 1 << 8;
//   const range = max - min + 1;
//   const byteArray = new Uint8Array(1);
//   window.crypto.getRandomValues(byteArray);
//   if (byteArray[0] >= ((max_range / range) << 0) * range) {
//     return getRandomInt(min, max);
//   }
//   return min + (byteArray[0] % range);
// }

// const randomInt = getRandomInt(2, 10);
// console.log(randomInt);

const byteArray = new Uint8Array(1);
window.crypto.getRandomValues(byteArray);
console.log(byteArray)
