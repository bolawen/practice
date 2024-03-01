const inputImgEl = document.getElementById('input-img');
const inputFileEl = document.getElementById('input-file');
const outputCanvasEl = document.getElementById('output-canvas');
const opencvLoadMessageEl = document.querySelector('.opencv-load-message');

inputFileEl.addEventListener('change', e => {
  const file = e.target.files[0];
  inputImgEl.src = URL.createObjectURL(file);
});

inputImgEl.addEventListener('load', () => {
  // 1. 获取输入矩阵
  const src = cv.imread(inputImgEl);
  // 2. 将输入矩阵显示到 outputCanvasEl 中
  cv.imshow(outputCanvasEl, src);
  // 3. 释放内存
  src.delete();
});

function onOpenCvReady() {
  cv['onRuntimeInitialized'] = () => {
    inputFileEl.disabled = false;
    opencvLoadMessageEl.innerHTML = 'OpenCV.js is ready!';
  };
}

inputFileEl.disabled = true;
opencvLoadMessageEl.innerHTML = 'OpenCV.js is loading……';
