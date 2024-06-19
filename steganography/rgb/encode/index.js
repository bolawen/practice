function mergeData(params) {
  const { ctx, imageData1, imageData2 } = params || {};

  const data1 = imageData1.data;
  const data2 = imageData2.data;

  for (let i = 0; i < data2.length; i += 4) {
    if (data1[i + 3] === 0 && data2[i] % 2 === 1) {
      // data1 alpha 通道值为 0，data2 通道值为奇数
      if (data2[i] === 255) {
        data2[i]--;
      } else {
        data2[i]++;
      }
    } else if (data1[i + 3] !== 0 && data2[i] % 2 === 0) {
      // data1 alpha 通道值不为 0，data2 通道值为偶数
      if (data2[i] === 255) {
        data2[i]--;
      } else {
        data2[i]++;
      }
    }
  }

  ctx.putImageData(imageData2, 0, 0);
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
      textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      mergeData({
        ctx,
        imageData1: textData,
        imageData2: originalData,
      });

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
