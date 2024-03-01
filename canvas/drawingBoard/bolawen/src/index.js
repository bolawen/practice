import Event from './event';
import Toolbar from './toolbar';
import Line from './object/line';
import Brush from './object/brush';
import Circle from './object/circle';
import Ellipse from './object/ellipse';
import { findActiveShape } from './inner';
import Rectangle from './object/rectangle';
import DrawingBoardTemplate from './template/drawing-board.html';
import { downFile, getRealPoint, getRelativeOfElPosition } from './util';

export const shapeMap = {
  line: 'line', // 直线
  circle: 'circle', // 圆形
  rectangle: 'rectangle', // 矩形
  text: 'text', // 文本
  brush: 'brush', // 画笔
  eraser: 'eraser' // 橡皮擦
};

// 操作工具
export const operationMap = {
  undo: 'undo', // 撤销
  redo: 'redo', // 重做
  move: 'move', // 移动
  save: 'save', // 保存
  clear: 'clear' // 清空
};

// 所有工具
export const toolMap = Object.assign({}, shapeMap, operationMap);

export default class DrawingBoard {
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
      default:
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
