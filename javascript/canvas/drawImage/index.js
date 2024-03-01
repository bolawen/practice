const getPixelRatio = context => {
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

const draw = config => {
  const { canvas, context, imgEl, width, height, ratio } = config;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.drawImage(imgEl, 0, 0);
};

const inputImgEl = document.querySelector('#input-img');
const inputFileEl = document.querySelector('#input-file');
const outputCanvasEl = document.querySelector('#output-canvas');
const outputCanvasCtx = outputCanvasEl.getContext('2d');
const ratio = getPixelRatio(outputCanvasCtx);

inputFileEl.addEventListener('change', e => {
  const file = e.target.files[0];
  inputImgEl.src = URL.createObjectURL(file);
});

inputImgEl.addEventListener('load', () => {
  const ratio = getPixelRatio(outputCanvasCtx);
  draw({
    ratio,
    imgEl: inputImgEl,
    canvas: outputCanvasEl,
    context: outputCanvasCtx,
    width: inputImgEl.naturalWidth,
    height: inputImgEl.naturalHeight
  });
});
