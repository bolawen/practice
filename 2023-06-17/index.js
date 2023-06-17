// new Promise((resolve) => {
//   throw new Error("失败");
// })
//   .then(() => {
//     console.log(1); // 不执行
//   })
//   .then(() => {
//     console.log(2); // 不执行
//   })
//   .catch((error) => {
//     console.log("catch error", error);
//   })
//   .then(() => {
//     console.log(3); // 3
//   });

// new Promise((resolve) => {
//   throw new Error("失败");
// })
//   .then(() => {
//     console.log(1); // 不执行
//   })
//   .then(
//     () => {
//       console.log(2); // 不执行
//     },
//     (error) => {
//       console.log("rejectCallback", error);
//     }
//   )
//   .then(() => {
//     console.log(3); // 3
//   });

// Promise.prototype.finally = function (callback) {
//   const promise = this.constructor;
//   return this.then(
//     (value) => promise.resolve(callback()).then(() => value),
//     (error) =>
//       promise.resolve(callback()).then(() => {
//         throw error;
//       })
//   );
// };

// new Promise((resolve) => {
//   //   resolve();
//   throw new Error("失败");
// })
//   .then(() => {
//     console.log(1);
//   })
//   .catch((error) => {
//     console.log("error", error);
//   })
//   .finally(() => {
//     console.log(2);
//   });

// function foo() {
//   console.log(1);
// }
