const downInvoker = e => {
  downInvoker?.value?.(e);
};
const moveInvoker = e => {
  moveInvoker?.value?.(e);
};
const upInvoker = e => {
  upInvoker?.value?.(e);
};
const outInvoker = e => {
  outInvoker?.value?.(e);
};

const scaleInvoker = e => {
  scaleInvoker?.value?.(e);
};

const keydownInvoker = e => {
  keydownInvoker?.value?.(e);
};

const keyupInvoker = e => {
  keyupInvoker?.value?.(e);
};

class Event {
  constructor(options) {
    this.downInvoker = downInvoker;
    this.moveInvoker = moveInvoker;
    this.upInvoker = upInvoker;
    this.outInvoker = outInvoker;
    this.scaleInvoker = scaleInvoker;
    this.keydownInvoker = keydownInvoker;
    this.keyupInvoker = keyupInvoker;

    this.drawingBoard = options.drawingBoard;
  }

  addEventListener() {
    this.drawingBoard.canvas.addEventListener('mousedown', this.downInvoker);
    document.addEventListener('mousemove', this.moveInvoker);
    document.addEventListener('mouseup', this.upInvoker);
    this.drawingBoard.canvas.addEventListener('mouseleave', this.outInvoker);

    this.drawingBoard.canvas.addEventListener('touchstart', this.downInvoker);
    document.addEventListener('touchmove', this.moveInvoker);
    document.addEventListener('touchend', this.upInvoker);

    document.addEventListener('mousewheel', this.scaleInvoker, {
      passive: false
    });

    document.addEventListener('keydown', this.keydownInvoker);
    document.addEventListener('keyup', this.keyupInvoker);
  }

  removeEventListener() {
    this.drawingBoard.canvas.removeEventListener('mousedown', this.downInvoker);
    document.removeEventListener('mousemove', this.moveInvoker);
    document.removeEventListener('mouseup', this.upInvoker);
    this.drawingBoard.canvas.removeEventListener('mouseleave', this.outInvoker);

    this.drawingBoard.canvas.removeEventListener(
      'touchstart',
      this.downInvoker
    );
    document.removeEventListener('touchmove', this.moveInvoker);
    document.removeEventListener('touchend', this.upInvoker);

    document.removeEventListener('mousewheel', this.scaleInvoker, {
      passive: false
    });

    document.removeEventListener('keydown', this.keydownInvoker);
    document.removeEventListener('keyup', this.keyupInvoker);
  }

  setEvent(type, fn) {
    switch (type) {
      case 'down':
        this.downInvoker.value = fn;
        break;
      case 'move':
        this.moveInvoker.value = fn;
        break;
      case 'up':
        this.upInvoker.value = fn;
        break;
      case 'out':
        this.outInvoker.value = fn;
        break;
      case 'scale':
        this.scaleInvoker.value = fn;
        break;
      case 'keydown':
        this.keydownInvoker.value = fn;
        break;
      case 'keyup':
        this.keyupInvoker.value = fn;
        break;
    }
  }
}

class Toolbar {
  constructor(options) {
    this.options = options;
    this.drawingBoard = options.drawingBoard;

    this.initEvent();
    this.initValue();
    this.initToolbar();
  }

  initToolbar() {
    this.container = document.querySelector('.toolbar-container');
    this.container.style.width = `${this.drawingBoard.width}px`;
  }

  initValue() {
    this.updateSelectedButton();
    this.initValueOfSize('line-size');
    this.initValueOfSize('font-size');
    this.initValueOfColorPicker('bg-color-picker');
    this.initValueOfColorPicker('fill-color-picker');
    this.initValueOfColorPicker('stroke-color-picker');
  }

  updateSelectedButton() {
    const buttonList = document.querySelectorAll(
      '.toolbar-container .toolbar-item_button'
    );
    for (let i = 0; i < buttonList.length; i++) {
      const button = buttonList[i];
      button.classList.remove('active');
      if (button.id === this.drawingBoard.selectedTool) {
        button.classList.add('active');
      }
    }
  }

  initValueOfSize(type) {
    const typeDom = document.getElementById(type);

    switch (type) {
      case 'line-size':
        typeDom.value = this.drawingBoard.lineSize;
        typeDom.previousElementSibling.innerHTML = this.drawingBoard.lineSize;
        break;
      case 'font-size':
        typeDom.value = this.drawingBoard.fontSize;
        typeDom.previousElementSibling.innerHTML = this.drawingBoard.fontSize;
        break;
    }
  }

  initValueOfColorPicker(type) {
    const typeDom = document.getElementById(type);

    switch (type) {
      case 'bg-color-picker':
        typeDom.value = this.drawingBoard.bgColor;
        break;
      case 'fill-color-picker':
        typeDom.value = this.drawingBoard.fillColor;
        break;
      case 'stroke-color-picker':
        typeDom.value = this.drawingBoard.strokeColor;
        break;
    }
  }

  initEvent() {
    this.watchButton();
    this.watchSize('line-size');
    this.watchSize('font-size');
    this.watchColorPicker('bg-color-picker');
    this.watchColorPicker('fill-color-picker');
    this.watchColorPicker('stroke-color-picker');
  }

  watchButton() {
    const buttonList = document.querySelectorAll(
      '.toolbar-container .toolbar-item_button'
    );
    for (let i = 0; i < buttonList.length; i++) {
      buttonList[i].addEventListener('click', e => {
        const type = e.target.id;
        this.drawingBoard.selectedTool = type;
        this.updateSelectedButton();
        this.drawingBoard.setTool(type);
      });
    }
  }

  watchSize(type) {
    const typeDom = document.getElementById(type);
    typeDom.addEventListener('input', e => {
      const { value } = e.target;
      this.updateSize(e.target, type, value);
    });
  }

  watchColorPicker(type) {
    const typeDom = document.getElementById(type);
    typeDom.addEventListener('input', e => {
      const { value } = e.target;
      this.updateColorPicker(e.target, type, value);
    });
  }

  updateSize(node, type, value) {
    node.previousElementSibling.innerHTML = value;

    switch (type) {
      case 'line-size':
        this.drawingBoard.setLineSize(value);
        break;
      case 'font-size':
        this.drawingBoard.setFontSize(value);
        break;
    }
  }
  updateColorPicker(node, type, value) {
    switch (type) {
      case 'bg-color-picker':
        this.drawingBoard.setBgColor(value);
        break;
      case 'fill-color-picker':
        this.drawingBoard.setFillColor(value);
        break;
      case 'stroke-color-picker':
        this.drawingBoard.setStrokeColor(value);
        break;
    }
  }
}

class Line {
  constructor(options) {
    this.options = options;
    this.type = options.type;
    this.data = options.data;
    this.context = options.context;
  }

  setCanvasStyle(options) {
    this.context.lineWidth = options.lineWidth;
    this.context.fillColor = options.fillColor;
    this.context.strokeStyle = options.strokeStyle;
  }

  render() {
    this.setCanvasStyle(this.options);
    const pointList = this.data.concat();
    this.context.beginPath();
    this.context.moveTo(pointList.shift(), pointList.shift());

    do {
      this.context.lineTo(pointList.shift(), pointList.shift());
    } while (pointList.length);

    this.context.stroke();
  }
}

const downFile = (url, fileName) => {
  const x = new XMLHttpRequest();
  x.open('GET', url, true);
  x.responseType = 'blob';
  x.onload = function () {
    const url = window.URL.createObjectURL(x.response);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };
  x.send();
};

function getRelativeOfElPosition(e, el) {
  const normalizedE = e.type.startsWith('mouse') ? e : e.targetTouches[0];
  const rect = el.getBoundingClientRect();
  let x = normalizedE.pageX - rect.left - window.scrollX;
  let y = normalizedE.pageY - rect.top - window.scrollY;
  return [x, y];
}

const getRealPoint = (canvasScale, translateXY, x, y) => {
  x = (x - translateXY.x) / canvasScale;
  y = (y - translateXY.y) / canvasScale;

  return [x, y];
};

function equalPoint(point1, point2) {
  return point1.x === point2.x && point1.y === point2.y;
}

function midPointFrom(point1, point2, t = 0.5) {
  t = Math.max(Math.min(1, t), 0);
  return {
    x: point1.x + (point2.x - point1.x) * t,
    y: point1.y + (point2.y - point1.y) * t
  };
}

class Brush {
  constructor(options) {
    this.points = [];
    this.options = options;
    this.width = options.width;
    this.canvas = options.canvas;
    this.context = options.context;
    this.drawingBoard = options.drawingBoard;
  }

  setCanvasStyle(options) {
    this.context.lineWidth = options.lineWidth;
    this.context.fillColor = options.fillColor;
    this.context.strokeStyle = options.strokeStyle;
    this.context.shadowColor = '#000'; // 通过绘制 元素阴影 的功能来模糊边缘出现的锯齿
    this.context.shadowBlur = 1; // 通过绘制 元素阴影 的功能来模糊边缘出现的锯齿
    this.context.lineCap = 'round'; // 通过设置 lineCap 改变线条末端线帽的样式，为每个末端添加圆形线帽，减少线条的生硬感
    this.context.lineJoin = 'round'; // 通过设置 lineJoin 指定条线交汇时为圆形边角
  }

  addPoint(point) {
    if (
      this.points.length > 0 &&
      equalPoint(point, this.points[this.points.length - 1])
    ) {
      return false;
    }

    this.points.push(point);
  }

  draw() {
    let p1 = this.points[0];
    let p2 = this.points[1];

    this.context.beginPath();
    if (this.points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
      const width = this.width / 1000;
      p1.x -= width;
      p2.x += width;
    }
    this.context.moveTo(p1.x, p1.y);

    for (let i = 1; i < this.points.length; i++) {
      this.drawSegment(p1, p2);
      p1 = this.points[i];
      p2 = this.points[i + 1];
    }

    this.context.lineTo(p1.x, p1.y);
    this.context.stroke();
    this.context.restore();
  }

  drawSegment(p1, p2) {
    const midPoint = midPointFrom(p1, p2);
    this.context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    return midPoint;
  }

  reset() {
    this.points = [];
  }

  prepareForDrawing(options) {
    const point = { x: options.x, y: options.y };

    this.reset();
    this.addPoint(point);
    this.setCanvasStyle(options);
    this.context.moveTo(point.x, point.y);
  }

  onDown(e, options) {
    this.prepareForDrawing(options);
    this.addPoint({ x: options.x, y: options.y });
    this.draw();
  }

  onMove(e, point) {
    this.addPoint(point);
    this.draw();
  }

  onUp(e) {
    this.oldEnd = undefined;
    // this.finalizeAndAddPath();
  }

  /**
   * @description: Todo onUp 事件中, 需要将 this.points 转换成 SVGPath, 然后创建 Path 对象, 并添加到 canvas 中。
   * 难点: 如何将 this.points 转换成 SVGPath 是难点, 之后再实现吧
   */
  finalizeAndAddPath() {
    this.context.closePath();
    const pathData = this.convertPointsToSVGPath(this.points);
    if (isEmptySVGPath(pathData)) {
      this.canvas.requestRenderAll();
      return;
    }

    const path = this.createPath(pathData);
    this.drawingBoard.clearContext(this.canvas.contextTop);
    this.drawingBoard.add(path);
    this.drawingBoard.render();
    path.setCoords();
  }
}

class Circle {
  constructor(options) {
    this.options = options;
    this.type = options.type;
    this.data = options.data;
    this.context = options.context;
  }

  setCanvasStyle(options) {
    this.context.lineWidth = options.lineWidth;
    this.context.fillColor = options.fillColor;
    this.context.strokeStyle = options.strokeStyle;
  }

  render() {
    this.setCanvasStyle(this.options);
    const [x, y, r] = this.data;
    this.context.beginPath();
    this.context.arc(x, y, r, 0, Math.PI * 2, false);
    this.context.stroke();
  }
}

class Ellipse {
  constructor(options) {
    this.options = options;
    this.type = options.type;
    this.data = options.data;
    this.context = options.context;
  }

  setCanvasStyle(options) {
    this.context.lineWidth = options.lineWidth;
    this.context.fillColor = options.fillColor;
    this.context.strokeStyle = options.strokeStyle;
  }

  render() {
    this.setCanvasStyle(this.options);
    const [x, y, longAxis, shortAxis] = this.data;
    this.context.beginPath();
    this.context.ellipse(x, y, longAxis, shortAxis, 0, 0, 2 * Math.PI);
    this.context.stroke();
  }
}

function isInnerRectangle(x0, y0, width, height, x, y) {
  return x0 <= x && y0 <= y && x0 + width >= x && y0 + height >= y;
}

function isInnerCircle(x0, y0, r, x, y) {
  return Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2) <= Math.pow(r, 2);
}

function isInnerPath(x0, y0, x1, y1, x, y, lineWidth) {
  var a1pow = Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2);
  var a1 = Math.sqrt(a1pow, 2);
  var a2pow = Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2);
  var a2 = Math.sqrt(a2pow, 2);

  var a3pow = Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2);
  var a3 = Math.sqrt(a3pow, 2);

  var r = lineWidth / 2;
  var ab = (a1pow - a2pow + a3pow) / (2 * a3);
  var h = Math.sqrt(a1pow - Math.pow(ab, 2), 2);

  var ad = Math.sqrt(Math.pow(a3, 2) + Math.pow(r, 2));

  return h <= r && a1 <= ad && a2 <= ad;
}

function findActiveShape(data, x, y) {
  let activeShape = null;

  for (let item of data) {
    switch (item.type) {
      case shapeMap.line:
        const lineNumber = item.data.length / 2 - 1;
        let flag = false;
        for (let i = 0; i < lineNumber; i++) {
          let index = i * 2;
          flag = isInnerPath(
            item.data[index],
            item.data[index + 1],
            item.data[index + 2],
            item.data[index + 3],
            x,
            y,
            item.lineWidth || 1
          );
          if (flag) {
            activeShape = item;
            break;
          }
        }
        break;
      case shapeMap.circle:
        isInnerCircle(...item.data, x, y) && (activeShape = item);
        break;
      case shapeMap.rectangle:
        isInnerRectangle(...item.data, x, y) && (activeShape = item);
        break;
    }
  }

  return activeShape;
}

class Rectangle {
  constructor(options) {
    this.options = options;
    this.type = options.type;
    this.data = options.data;
    this.context = options.context;
  }

  setCanvasStyle(options) {
    this.context.lineWidth = options.lineWidth;
    this.context.fillColor = options.fillColor;
    this.context.strokeStyle = options.strokeStyle;
  }

  render() {
    this.setCanvasStyle(this.options);
    const [rectangleX, rectangleY, rectangleWidth, rectangleHeight] = this.data;

    this.context.strokeRect(
      rectangleX,
      rectangleY,
      rectangleWidth,
      rectangleHeight
    );
  }
}

var DrawingBoardTemplate = "<style>\n  .canvas-container {\n    overflow: hidden;\n    position: relative;\n  }\n  canvas {\n    user-select: none;\n    touch-action: none; /* 防止绘制时浏览器滑动 */\n  }\n  #canvas {\n    position: absolute;\n    left: 0px;\n    top: 0px;\n    z-index: 1;\n  }\n  #bgCanvas {\n    position: absolute;\n    left: 0px;\n    top: 0px;\n  }\n  #cacheCanvas {\n    position: absolute;\n    left: 0px;\n    top: 0px;\n    z-index: -1;\n  }\n\n  .toolbar-container {\n    gap: 24px;\n    width: 100%;\n    display: flex;\n    align-items: center;\n    flex-wrap: wrap;\n    margin-bottom: 24px;\n    justify-content: flex-start;\n  }\n  .toolbar-item {\n    flex: none;\n    gap: 12px;\n    display: flex;\n    align-items: center;\n    justify-content: flex-start;\n  }\n  .toolbar-item_button.active {\n    color: #fff;\n    background-color: #384bc8;\n  }\n</style>\n\n<div class=\"drawing-board\">\n  <div class=\"toolbar-container\">\n    <div class=\"toolbar-item toolbar-item_stroke-color-picker\">\n      <div class=\"label\">stroke color</div>\n      <div class=\"color-picker\">\n        <input id=\"stroke-color-picker\" type=\"color\" />\n      </div>\n    </div>\n    <div class=\"toolbar-item toolbar-item_fill-color-picker\">\n      <div class=\"label\">fill color</div>\n      <div class=\"color-picker\">\n        <input id=\"fill-color-picker\" type=\"color\" />\n      </div>\n    </div>\n    <div class=\"toolbar-item toolbar-item_bg-color-picker\">\n      <div class=\"label\">bg color</div>\n      <div class=\"color-picker\">\n        <input id=\"bg-color-picker\" type=\"color\" />\n      </div>\n    </div>\n    <div class=\"toolbar-item toolbar-item_line-size\">\n      <div class=\"label\">line size:</div>\n      <div class=\"value\">1</div>\n      <input id=\"line-size\" type=\"range\" min=\"1\" max=\"100\" />\n    </div>\n    <div class=\"toolbar-item toolbar-item_font-size\">\n      <div class=\"label\">font size:</div>\n      <div class=\"value\">1</div>\n      <input id=\"font-size\" type=\"range\" min=\"1\" max=\"100\" />\n    </div>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"brush\">brush</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"line\">line</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"rectangle\">\n      rectangle\n    </button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"circle\">circle</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"move\">move</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"undo\">undo</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"redo\">redo</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"clear\">clear</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"save\">save</button>\n  </div>\n\n  <div class=\"canvas-container\">\n    <canvas id=\"canvas\" width=\"400\" height=\"400\"></canvas>\n    <canvas id=\"bgCanvas\" width=\"400\" height=\"400\"></canvas>\n    <canvas id=\"cacheCanvas\" width=\"400\" height=\"400\"></canvas>\n  </div>\n</div>\n";

const shapeMap = {
  line: 'line', // 直线
  circle: 'circle', // 圆形
  rectangle: 'rectangle', // 矩形
  text: 'text', // 文本
  brush: 'brush', // 画笔
  eraser: 'eraser' // 橡皮擦
};

// 操作工具
const operationMap = {
  undo: 'undo', // 撤销
  redo: 'redo', // 重做
  move: 'move', // 移动
  save: 'save', // 保存
  clear: 'clear' // 清空
};

// 所有工具
const toolMap = Object.assign({}, shapeMap, operationMap);

class DrawingBoard {
  constructor(options) {
    this.canvas = null; // 画布
    this.bgCanvas = null; // 背景画布
    this.cacheCanvas = null; // 缓存画布

    this.context = null; // 画布上下文
    this.bgContext = null; // 背景画布上下文
    this.cacheContext = null; // 缓存画布上下文

    this.objects = []; // 画布数据
    this.activeShape = null; // 当前选中的图形
    this.canvasHistoryIndex = 0; // 画布历史记录索引
    this.canvasHistoryList = []; // 保存画布的历史记录
    this.selectedTool = toolMap.move; // 当前选中的工具
    this.drawingObject = null; /// 鼠标未松开时用户绘制的临时图像
    this.freeDrawingObject = null; // 自由绘制对象（画笔、橡皮）
    this.isFreeDraw = true; // 是否为自由绘制模式 （画笔、橡皮）

    this.lineSize = 1; // 线条大小
    this.fontSize = 18; // 字体大小

    this.canvasScale = 1;
    this.canvasScale = 1;
    this.canvasMaxScale = 5;
    this.canvasMinScale = 0.5;
    this.canvasScaleFactor = 0.1;

    this.translateXY = {
      x: 0,
      y: 0
    }; // 画布平移坐标

    this.lastTranslateXY = {
      x: 0,
      y: 0
    }; // 上一次画布平移坐标

    this.downXY = {
      x: 0,
      y: 0
    }; // 鼠标按下时的坐标
    this.moveXY = {
      x: 0,
      y: 0
    };

    this.lastShapeXY = {
      x: 0,
      y: 0
    };

    this.isDrawing = false; // 当前是否正在绘制图形（画笔，文本模式除外）
    this.isRedoing = false; // 当前是否在执行撤销或重做操作
    this.isShiftDown = false; // 当前是否按下了 shift 键

    this.strokeColor = '#000000'; // 线框色
    this.showStrokeColorPicker = false; // 是否显示 线框色选择器
    this.fillColor = 'rgba(0,0,0,0)'; // 填充色
    this.showFillColorPicker = false; // 是否显示 填充色选择器
    this.bgColor = '#2F782C'; // 背景色
    this.showBgColorPicker = false; // 是否显示 背景色选择器

    this.canvasWrapper = null;
    this.container = options.container || document.body;
    this.container.innerHTML = DrawingBoardTemplate;

    this.initCanvasWrapper(options);
    this.initCanvas(options);
    this.initEvent();
    this.initToolbar();
    this.setCursorStyle(this.selectedTool);
  }

  initCanvas(options) {
    const { width, height } = options;
    this.canvas = document.getElementById('canvas');
    this.bgCanvas = document.getElementById('bgCanvas');
    this.cacheCanvas = document.getElementById('cacheCanvas');
    this.context = this.canvas.getContext('2d');
    this.bgContext = this.bgCanvas.getContext('2d');
    this.cacheContext = this.cacheCanvas.getContext('2d');

    this.setCanvasSize(this.canvas, width, height);
    this.setCanvasSize(this.bgCanvas, width, height);
    this.setCanvasSize(this.cacheCanvas, width, height);

    const canvasData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.canvasHistoryList = [];
    this.canvasHistoryList.push(canvasData);
    this.currentCanvasIndex = 0;

    this.setCursorStyle(shapeMap.move);
    this.setCanvasBg(this.bgContext, this.bgColor);
  }

  initCanvasWrapper(options) {
    const { width, height } = options;
    this.canvasWrapper = document.querySelector('.canvas-container');
    this.canvasWrapper.style.width = width + 'px';
    this.canvasWrapper.style.height = height + 'px';
  }

  initToolbar() {
    this.toolbar = new Toolbar({
      drawingBoard: this
    });
  }

  setCanvasBg(context, bgOrColor) {
    context.fillStyle = bgOrColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  setCanvasSize(canvas, width, height) {
    canvas.width = this.width = width;
    canvas.height = this.height = height;
  }

  // 存储画布状态
  setCanvasData(canvasData) {
    this.context.putImageData(canvasData, 0, 0);
  }

  initEvent() {
    this.event = new Event({ drawingBoard: this });
    this.event.addEventListener();

    this.event.setEvent('down', this.onDown.bind(this));
    this.event.setEvent('keydown', this.onKeydown.bind(this));
    this.event.setEvent('keyup', this.onKeyup.bind(this));
    this.event.setEvent('scale', this.onScale.bind(this));
  }

  onKeydown(e) {
    if (e.key == 'Shift') {
      this.isShiftDown = true;
    }
  }

  onKeyup() {
    this.isShiftDown = false;
  }

  setPoint(type, x, y) {
    this[type].x = x;
    this[type].y = y;
  }

  onDown(e) {
    this.isDrawing = true;
    this.updateCanvasHistory();

    let [x1, y1] = getRelativeOfElPosition(e, this.canvas);
    let [x2, y2] = getRealPoint(this.canvasScale, this.translateXY, x1, y1);

    switch (this.selectedTool) {
      case toolMap.line:
      case toolMap.circle:
      case toolMap.rectangle:
        this.setPoint('downXY', x2, y2);
        break;
      case toolMap.brush:
        this.setCanvasTransform();
        this.freeDrawingObject.onDown(e, {
          x: x2,
          y: y2,
          shadowBlur: 1,
          lineCap: 'round',
          lineJoin: 'round',
          shadowColor: '#000',
          lineWidth: this.lineSize,
          strokeStyle: this.strokeColor
        });
        break;
      case toolMap.move:
        this.setPoint('downXY', x1, y1);
        this.setPoint(
          'lastTranslateXY',
          this.translateXY.x,
          this.translateXY.y
        );

        this.activeShape = null;
        this.activeShape = findActiveShape(this.objects, x2, y2);

        if (!this.activeShape) {
          this.setCursorStyle(shapeMap.move, 'grabbing');
        } else {
          this.setPoint('lastShapeXY', 0, 0);
          this.setCursorStyle(shapeMap.move, 'all-scroll');
        }
        break;
    }

    this.event.setEvent('move', this.onMove.bind(this));
    this.event.setEvent('up', this.onUp.bind(this));
    this.event.setEvent('out', this.onOut.bind(this));
  }

  onMove(e) {
    if (!this.isDrawing) {
      return;
    }

    let [x1, y1] = getRelativeOfElPosition(e, this.canvas);
    let [x2, y2] = getRealPoint(this.canvasScale, this.translateXY, x1, y1);

    if (this.drawingObject) {
      this.remove(this.drawingObject);
    }

    switch (this.selectedTool) {
      case toolMap.move:
        this.setPoint('moveXY', x1, y1);
        this.drawMove(e);
        break;
      case toolMap.line:
        this.setPoint('moveXY', x2, y2);
        this.drawLine(e);
        break;
      case toolMap.brush:
        this.setPoint('moveXY', x2, y2);
        this.drawBrush(e);
        break;
      case toolMap.circle:
        this.setPoint('moveXY', x2, y2);
        this.drawCircle(e);
        break;
      case toolMap.eraser:
        this.setPoint('moveXY', x2, y2);
        this.drawEraser(e);
        break;
      case toolMap.rectangle:
        this.setPoint('moveXY', x2, y2);
        this.drawRectangle(e);
        break;
    }
  }

  onUp(e) {
    this.isDrawing = false;
    this.drawingObject = null;
    this.setCursorStyle(this.selectedTool, '');

    switch (this.selectedTool) {
      case toolMap.brush:
        this.freeDrawingObject.onUp(e);
        break;
    }

    this.event.setEvent('move', null);
  }

  onOut(e) {
    this.isDrawing = false;
    this.drawingObject = null;
    this.event.setEvent('move', null);
  }

  onScale(e) {
    e.preventDefault();
    if (!e.wheelDelta) {
      return;
    }

    let [x, y] = getRelativeOfElPosition(e, canvas);

    x = x - this.translateXY.x;
    y = y - this.translateXY.y;

    const moveX = (x / this.canvasScale) * this.canvasScaleFactor;
    const moveY = (y / this.canvasScale) * this.canvasScaleFactor;

    if (e.wheelDelta > 0) {
      this.translateXY.x -= this.canvasScale >= this.canvasMaxScale ? 0 : moveX;
      this.translateXY.y -= this.canvasScale >= this.canvasMaxScale ? 0 : moveY;
      this.canvasScale += this.canvasScaleFactor;
    } else {
      this.translateXY.x += this.canvasScale <= this.canvasMinScale ? 0 : moveX;
      this.translateXY.y += this.canvasScale <= this.canvasMinScale ? 0 : moveY;
      this.canvasScale -= this.canvasScaleFactor;
    }

    this.canvasScale = Math.min(
      this.canvasMaxScale,
      Math.max(this.canvasScale, this.canvasMinScale)
    );

    this.render();
  }

  drawLine(e) {
    this.undo();

    const object = new Line({
      canvas: this.canvas,
      type: shapeMap.line,
      context: this.context,
      lineWidth: this.lineSize,
      strokeStyle: this.strokeColor,
      data: [this.downXY.x, this.downXY.y, this.moveXY.x, this.moveXY.y]
    });

    this.add(object);
    this.drawingObject = object;
    this.updateCanvasHistory();
  }

  drawBrush(e) {
    this.freeDrawingObject.onMove(e, {
      x: this.moveXY.x,
      y: this.moveXY.y
    });

    this.updateCanvasHistory();
  }

  drawCircle(e) {
    this.undo();

    const centerX = (this.moveXY.x + this.downXY.x) / 2;
    const centerY = (this.moveXY.y + this.downXY.y) / 2;

    if (this.isShiftDown) {
      const radius =
        Math.abs(this.moveXY.x - this.downXY.x) <
        Math.abs(this.moveXY.y - this.downXY.y)
          ? Math.abs(this.moveXY.x - this.downXY.x) / 2
          : Math.abs(this.moveXY.y - this.downXY.y) / 2;

      const object = new Circle({
        canvas: this.canvas,
        context: this.context,
        type: shapeMap.circle,
        lineWidth: this.lineSize,
        strokeStyle: this.strokeColor,
        data: [centerX, centerY, radius]
      });

      this.add(object);
      this.drawingObject = object;
    } else {
      const longAxis = Math.abs(this.moveXY.x - this.downXY.x) / 2;
      const shortAxis = Math.abs(this.moveXY.y - this.downXY.y) / 2;

      const object = new Ellipse({
        canvas: this.canvas,
        context: this.context,
        type: shapeMap.ellipse,
        lineWidth: this.lineSize,
        strokeStyle: this.strokeColor,
        data: [centerX, centerY, longAxis, shortAxis]
      });
      this.add(object);
      this.drawingObject = object;
    }

    this.updateCanvasHistory();
  }

  drawRectangle(e) {
    this.undo();

    const rectangleX =
      this.downXY.x <= this.moveXY.x ? this.downXY.x : this.moveXY.x;
    const rectangleY =
      this.downXY.y <= this.moveXY.y ? this.downXY.y : this.moveXY.y;

    const object = new Rectangle({
      data: [],
      canvas: this.canvas,
      context: this.context,
      lineWidth: this.lineSize,
      type: shapeMap.rectangle,
      strokeStyle: this.strokeColor
    });

    if (this.isShiftDown) {
      const squareWidth =
        Math.abs(this.moveXY.x - this.downXY.x) <
        Math.abs(this.moveXY.y - this.downXY.y)
          ? Math.abs(this.moveXY.x - this.downXY.x)
          : Math.abs(this.moveXY.y - this.downXY.y);
      if (this.moveXY.x < this.downXY.x) {
        if (this.moveXY.y < this.downXY.y)
          object.data = [
            this.downXY.x,
            this.downXY.y,
            -squareWidth,
            -squareWidth
          ];
        else
          object.data = [
            this.downXY.x,
            this.downXY.y,
            -squareWidth,
            squareWidth
          ];
      } else object.data = [rectangleX, rectangleY, squareWidth, squareWidth];
    } else {
      const rectangleWidth = Math.abs(this.moveXY.x - this.downXY.x);
      const rectangleHeight = Math.abs(this.moveXY.y - this.downXY.y);

      object.data = [rectangleX, rectangleY, rectangleWidth, rectangleHeight];
    }

    this.add(object);
    this.drawingObject = object;
    this.updateCanvasHistory();
  }

  drawMove(e) {
    if (!this.activeShape) {
      this.onMoveCanvasBoard(e);
    } else {
      this.onMoveCanvasShape(e);
    }
  }

  onMoveCanvasBoard(e) {
    const maxMoveX = this.canvas.width / 1;
    const maxMoveY = this.canvas.height / 1;

    const moveX = this.lastTranslateXY.x + this.moveXY.x - this.downXY.x;
    const moveY = this.lastTranslateXY.y + this.moveXY.y - this.downXY.y;

    this.setPoint(
      'translateXY',
      Math.abs(moveX) > maxMoveX ? this.translateXY.x : moveX,
      Math.abs(moveY) > maxMoveY ? this.translateXY.y : moveY
    );

    this.render();
    this.updateCanvasHistory();
  }

  onMoveCanvasShape() {
    let moveX = this.moveXY.x - (this.lastShapeXY.x || this.downXY.x);
    let moveY = this.moveXY.y - (this.lastShapeXY.y || this.downXY.y);

    moveX /= this.canvasScale;
    moveY /= this.canvasScale;

    switch (this.activeShape.type) {
      case shapeMap.rectangle:
        let xr = this.activeShape.data[0];
        let yr = this.activeShape.data[1];
        let width = this.activeShape.data[2];
        let height = this.activeShape.data[3];
        this.activeShape.data = [xr + moveX, yr + moveY, width, height];
        break;
      case shapeMap.circle:
        let xc = this.activeShape.data[0];
        let yc = this.activeShape.data[1];
        let r = this.activeShape.data[2];
        this.activeShape.data = [xc + moveX, yc + moveY, r];
        break;
      case shapeMap.line:
        const item = this.activeShape;
        const lineNumber = item.data.length / 2;
        for (let i = 0; i < lineNumber; i++) {
          let index = i * 2;
          item.data[index] += moveX;
          item.data[index + 1] += moveY;
        }
    }

    this.setPoint('lastShapeXY', this.moveXY.x, this.moveXY.y);
    this.render();
    this.updateCanvasHistory();
  }

  save() {
    const bgCanvas = this.bgContext.getImageData(
      0,
      0,
      this.bgCanvas.width,
      this.bgCanvas.width
    );
    this.cacheContext.putImageData(bgCanvas, 0, 0);
    this.cacheContext.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const image = new Image();
    image.src = this.cacheCanvas.toDataURL('image/png');
    const url = image.src.replace(
      /^data:image\/[^;]/,
      'data:application/octet-stream'
    );
    downFile(url, 'test.png');
  }

  clear() {
    this.canvasHistoryIndex = 0;
    this.canvasHistoryList = this.canvasHistoryList.slice(0, 1);
    const canvasData = this.canvasHistoryList[0];
    this.setCanvasData(canvasData);
  }

  redo() {
    if (this.canvasHistoryIndex < this.canvasHistoryList.length - 1) {
      this.canvasHistoryIndex++;
      const canvasData = this.canvasHistoryList[this.canvasHistoryIndex];
      this.setCanvasData(canvasData);
    }
  }

  undo() {
    if (this.canvasHistoryIndex > 0) {
      this.canvasHistoryIndex--;
      const canvasData = this.canvasHistoryList[this.canvasHistoryIndex];
      this.setCanvasData(canvasData);
    }
  }

  setTool(tool) {
    this.selectedTool = tool;
    this.setCursorStyle(tool);

    switch (tool) {
      case toolMap.brush:
        this.freeDrawingObject = new Brush({
          width: this.width,
          canvas: this.canvas,
          context: this.context,
          drawingBoard: this
        });
        break;
      case toolMap.redo:
        this.redo();
        break;
      case toolMap.undo:
        this.undo();
        break;
      case toolMap.save:
        this.save();
        break;
      case toolMap.clear:
        this.clear();
        break;
    }
  }

  setLineSize(value) {
    this.lineSize = value;
  }

  setFontSize(value) {
    this.fontSize = value;
  }

  setBgColor(value) {
    this.bgColor = value;
  }

  setFillColor(value) {
    this.fillColor = value;
  }

  setStrokeColor(value) {
    this.strokeColor = value;
  }

  updateCanvasHistory() {
    const canvasData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (this.canvasHistoryIndex < this.canvasHistoryList.length - 1) {
      this.canvasHistoryList = this.canvasHistoryList.slice(
        0,
        this.canvasHistoryIndex + 1
      );
    }

    this.canvasHistoryList.push(canvasData);
    this.canvasHistoryIndex += 1;
  }

  setCursorStyle(tool, type) {
    if (type) {
      this.canvas.style.cursor = type;
      return;
    }

    switch (tool) {
      case toolMap.brush:
        this.canvas.style.cursor = `url(http://127.0.0.1:5502/test/canvas/drawingBoard/bolawen/src/svg/brush.svg) 6 26, pointer`;
        break;
      case toolMap.circle:
        this.canvas.style.cursor = `url(http://127.0.0.1:5502/test/canvas/drawingBoard/bolawen/src/svg/shape.svg) 6 26, pointer`;
        break;
      case toolMap.rectangle:
        this.canvas.style.cursor = `url(http://127.0.0.1:5502/test/canvas/drawingBoard/bolawen/src/svg/shape.svg) 14 14, pointer`;
        break;
      case toolMap.line:
        this.canvas.style.cursor = `url(http://127.0.0.1:5502/test/canvas/drawingBoard/bolawen/src/svg/shape.svg) 14 14, pointer`;
        break;
      case toolMap.move:
        this.canvas.style.cursor = `all-scroll`;
        break;
      case toolMap.eraser:
        this.canvas.style.cursor = `url(http://127.0.0.1:5502/test/canvas/drawingBoard/bolawen/src/svg/eraser.svg) 16 16, pointer`;
        break;
      default:
        this.canvas.style.cursor = 'default';
        break;
    }
  }

  add(...objects) {
    this.objects.push(...objects);
    this.render();
  }

  remove(...objects) {
    objects.forEach(object => {
      const index = this.objects.indexOf(object);
      if (index !== -1) {
        this.objects.splice(index, 1);
      }
    });
    this.render();
  }

  render() {
    this.canvas.width = this.width;
    this.bgCanvas.width = this.width;

    this.setCanvasTransform();
    this.setCanvasBg(this.bgContext, this.bgColor);

    this.objects.forEach(object => {
      object.render();
    });
  }

  setCanvasTransform() {
    this.context.setTransform(
      this.canvasScale,
      0,
      0,
      this.canvasScale,
      this.translateXY.x,
      this.translateXY.y
    );
  }
}

export { DrawingBoard as default, operationMap, shapeMap, toolMap };
//# sourceMappingURL=index.js.map
