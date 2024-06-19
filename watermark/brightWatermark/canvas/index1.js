// function cssHelper(el, prototype) {
//   for (let i in prototype) {
//     el.style[i] = prototype[i];
//   }
// }

// function drawRotateText() {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   canvas.width = 180;
//   canvas.height = 100;

//   // 先旋转
//   const degress = -30 * (Math.PI / 180);
//   const cos = Math.cos(degress);
//   const sin = Math.sin(degress);
//   ctx.transform(cos, sin, -sin, cos, 0, 0);

//   // 再绘制
//   ctx.fillStyle = "#000";
//   ctx.font = `16px serif`;
//   ctx.fillText("旋转文案", 0, 80);

//   document.body.appendChild(canvas);
// }

// drawRotateText();

// function drawRotateRectangle(params) {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   canvas.width = 400;
//   canvas.height = 400;

//   // 旋转前 绘制矩形
//   ctx.fillStyle = "grey";
//   ctx.fillRect(200, 0, 100, 50);

//   // 旋转画布
//   const degress1 = 30 * (Math.PI / 180);
//   const cos1 = Math.cos(degress1);
//   const sin1 = Math.sin(degress1);
//   ctx.transform(cos1, sin1, -sin1, cos1, 0, 0);

//   // 旋转后 绘制矩形
//   ctx.fillStyle = "red";
//   ctx.fillRect(200, 0, 100, 50);

//   // 旋转画布
//   const degress2 = 32 * (Math.PI / 180);
//   const cos2 = Math.cos(degress2);
//   const sin2 = Math.sin(degress2);
//   ctx.transform(cos2, sin2, -sin2, cos2, 0, 0);

//   // 旋转后 绘制矩形
//   ctx.fillStyle = "blue";
//   ctx.fillRect(200, 0, 100, 50);

//   document.body.appendChild(canvas);
// }

// drawRotateRectangle();

// function drawTranslateRectangle() {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   canvas.width = 400;
//   canvas.height = 400;

//   // 平移前 绘制矩形
//   ctx.fillStyle = "grey";
//   ctx.fillRect(0, 0, 200, 100);

//   // 通过 transform 平移画布
//   ctx.transform(1, 0, 0, 1, 100, 100);

//   // 平移后 绘制矩形
//   ctx.fillStyle = "red";
//   ctx.fillRect(0, 0, 200, 100);

//   document.body.appendChild(canvas);
// }

// drawTranslateRectangle();

// const canvas = document.createElement("canvas");
// const ctx = canvas.getContext("2d");

// const img = new Image();

// function mergeImageData(params) {
//   const { ctx, imageData1, imageData2 } = params;

//   const data1 = imageData1.data;
//   const data2 = imageData2.data;

//   for (let i = 0; i < data2.length; i += 4) {
//     if (data1[i + 3] === 0 && data2[i] % 2 === 1) {
//       // data1 alpha 通道值为 0，data2 通道值为奇数
//       if (data2[i] === 255) {
//         data2[i]--;
//       } else {
//         data2[i]++;
//       }
//     } else if (data1[i + 3] !== 0 && data2[i] % 2 === 0) {
//       // data1 alpha 通道值不为 0，data2 通道值为偶数
//       if (data2[i] === 255) {
//         data2[i]--;
//       } else {
//         data2[i]++;
//       }
//     }
//   }

//   ctx.putImageData(imageData2, 0, 0);
// }

// function decompose(params) {
//   const { ctx, imageData } = params;
//   const data = imageData.data;

//   for (let i = 0; i < data.length; i += 4) {
//     if (data[i] % 2 == 0) {
//       data[i] = 0;
//     } else {
//       data[i] = 255;
//     }

//     data[i + 1] = 0; // 关闭其他分量, 不处理的话也可以, 会显示原图
//     data[i + 2] = 0; // 关闭其他分量, 不处理的话也可以, 会显示原图
//   }

//   ctx.putImageData(imageData, 0, 0);
// }

// img.onload = function () {
//   canvas.width = this.naturalWidth;
//   canvas.height = this.naturalHeight;

//   const text = "Hello World";
//   ctx.font = "30px Microsoft Yahei";
//   ctx.fillText(text, 60, 130);
//   const textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//   ctx.drawImage(this, 0, 0);
//   const imgImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   mergeImageData({
//     ctx,
//     imageData1: textImageData,
//     imageData2: imgImageData,
//   });
//   decompose({ ctx, imageData: imgImageData });
// };
// img.src = "../../images/41cd22ab-9fee-45d4-92a0-722d9ee7fd29-1.png";

// document.body.appendChild(canvas);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// 保存当前 Canvas 状态, 当前状态是 (0, 0) 原点
ctx.save();

// 更改 Canvas 旋转中心为 Canvas 中心
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.rotate(30 * (Math.PI / 180));
ctx.fillStyle = "red";
ctx.fillRect(0, 0, 50, 50);

// 恢复到上一个 Canvas 状态, 即 (0, 0) 原点
ctx.restore();
ctx.fillStyle = "blue";
ctx.fillRect(0, 0, 50, 50);

document.body.appendChild(canvas);
