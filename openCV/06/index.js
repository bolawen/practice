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
  // 2. 创建灰度图像矩阵
  const gray = new cv.Mat();
  // 3. 将图像从一个颜色空间转换到另一个颜色空间
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  // 4. 创建边缘图像矩阵
  const edges = new cv.Mat();
  // 5. 灰度图像 使用 Canny 算法检测边缘
  cv.Canny(gray, edges, 50, 150);
  // 4. 将边缘图像矩阵显示到 outputCanvasEl 中
  cv.imshow(outputCanvasEl, edges);
  // 5. 释放内存
  src.delete();
  gray.delete();
  edges.delete();
});

function onOpenCvReady() {
  cv['onRuntimeInitialized'] = () => {
    inputFileEl.disabled = false;
    opencvLoadMessageEl.innerHTML = 'OpenCV.js is ready!';
  };
}

inputFileEl.disabled = true;
opencvLoadMessageEl.innerHTML = 'OpenCV.js is loading……';
