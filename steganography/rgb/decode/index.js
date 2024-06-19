function processData(params) {
  const { ctx, imageData } = params || {};
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] % 2 == 0) {
      data[i] = 0;
    } else {
      data[i] = 255;
    }

    data[i + 1] = 0; // 关闭其他分量, 不处理的话也可以, 会显示原图
    data[i + 2] = 0; // 关闭其他分量, 不处理的话也可以, 会显示原图
  }

  ctx.putImageData(imageData, 0, 0);
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
      processData({
        ctx,
        imageData: originalData,
      });

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
