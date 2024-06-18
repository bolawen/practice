function mergeData(ctx, newData, color, originalData) {
  const oData = originalData.data;
  let bit;
  let offset; // 找到 alpha 通道值

  switch (color) {
    case "R":
      bit = 0;
      offset = 3;
      break;
    case "G":
      bit = 1;
      offset = 2;
      break;
    case "B":
      bit = 2;
      offset = 1;
      break;
  }

  for (var i = 0; i < oData.length; i++) {
    if (i % 4 == bit) {
      // 只处理目标通道
      if (newData[i + offset] === 0 && oData[i] % 2 === 1) {
        // 没有信息的像素，该通道最低位置0，但不要越界
        if (oData[i] === 255) {
          oData[i]--;
        } else {
          oData[i]++;
        }
      } else if (newData[i + offset] !== 0 && oData[i] % 2 === 0) {
        // // 有信息的像素，该通道最低位置1，可以想想上面的斑点效果是怎么实现的
        oData[i]++;
      }
    }
  }

  ctx.putImageData(originalData, 0, 0);
}

function encodeImage(params) {
  return new Promise((resolve) => {
    const { src = "", text = "" } = params || {};

    let textData;
    let originalData;
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;

      ctx.font = "30px Microsoft Yahei";
      ctx.fillText(text, 60, 130);
      textData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      ctx.drawImage(img, 0, 0);
      originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      mergeData(ctx, textData, "R", originalData);

      const encodeImg = canvas.toDataURL("image/png");
      resolve(encodeImg);
    };

    img.src = src;
  });
}

async function run() {
  const encodeImg = await encodeImage({
    src: "../../images/origin.png",
    text: "柏拉文的秘密",
  });

  const img = new Image();
  img.src = encodeImg;
  document.body.appendChild(img);
}

run();
