function processData(ctx, originalData) {
  const data = originalData.data;
  for (let i = 0; i < data.length; i++) {
    if (i % 4 == 0) {
      // R分量
      if (data[i] % 2 == 0) {
        data[i] = 0;
      } else {
        data[i] = 255;
      }
    } else if (i % 4 == 3) {
      // alpha通道不做处理
      continue;
    } else {
      // 关闭其他分量，不关闭也不影响答案
      data[i] = 0;
    }
  }
  // 将结果绘制到画布
  ctx.putImageData(originalData, 0, 0);
}

function decodeImage(params) {
  return new Promise((resolve) => {
    const { src = "" } = params || {};

    let originalData;
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;

      ctx.drawImage(img, 0, 0);
      originalData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      processData(ctx, originalData);

      const decodeImg = canvas.toDataURL("image/png");
      resolve(decodeImg);
    };

    img.src = src;
  });
}

async function run() {
  const decodeImg = await decodeImage({
    src: "../../images/encode.png",
  });

  const img = new Image();
  img.src = decodeImg;
  document.body.appendChild(img);
}

run();
