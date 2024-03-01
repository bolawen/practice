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
  // 2. 创建图像矩阵
  const dst = new cv.Mat();
  // 3. 将图像从一个颜色空间转换到另一个颜色空间
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  // 4. 将输入矩阵显示到 outputCanvasEl 中
  cv.imshow(outputCanvasEl, dst);
  // 5. 释放内存
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
