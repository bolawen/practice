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

var DrawingBoardTemplate = "<style>\n  canvas {\n    user-select: none;\n    touch-action: none; /* 防止绘制时浏览器滑动 */\n  }\n\n  .toolbar-container {\n    width: 600px;\n    gap: 24px;\n    display: flex;\n    align-items: center;\n    flex-wrap: wrap;\n    margin-bottom: 24px;\n    justify-content: flex-start;\n  }\n  .toolbar-item {\n    flex: none;\n    gap: 12px;\n    display: flex;\n    align-items: center;\n    justify-content: flex-start;\n  }\n  .toolbar-item_button.active {\n    color: #fff;\n    background-color: #384bc8;\n  }\n</style>\n\n<div class=\"drawing-board\">\n  <div class=\"toolbar-container\">\n    <div class=\"toolbar-item toolbar-item_stroke-color-picker\">\n      <div class=\"label\">stroke color</div>\n      <div class=\"color-picker\">\n        <input id=\"stroke-color-picker\" type=\"color\" />\n      </div>\n    </div>\n    <div class=\"toolbar-item toolbar-item_fill-color-picker\">\n      <div class=\"label\">fill color</div>\n      <div class=\"color-picker\">\n        <input id=\"fill-color-picker\" type=\"color\" />\n      </div>\n    </div>\n    <div class=\"toolbar-item toolbar-item_bg-color-picker\">\n      <div class=\"label\">bg color</div>\n      <div class=\"color-picker\">\n        <input id=\"bg-color-picker\" type=\"color\" />\n      </div>\n    </div>\n    <div class=\"toolbar-item toolbar-item_line-size\">\n      <div class=\"label\">line size:</div>\n      <div class=\"value\">1</div>\n      <input id=\"line-size\" type=\"range\" min=\"1\" max=\"100\" />\n    </div>\n    <div class=\"toolbar-item toolbar-item_font-size\">\n      <div class=\"label\">font size:</div>\n      <div class=\"value\">1</div>\n      <input id=\"font-size\" type=\"range\" min=\"1\" max=\"100\" />\n    </div>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"text\">text</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"brush\">brush</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"line\">line</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"rect\">\n      rect\n    </button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"circle\">circle</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"eraser\">eraser</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"move\">move</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"undo\">undo</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"redo\">redo</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"zoomOut\">zoomOut</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"zoomIn\">zoomIn</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"clear\">clear</button>\n    <button class=\"toolbar-item toolbar-item_button\" id=\"save\">save</button>\n  </div>\n\n  <canvas id=\"canvas\"></canvas>\n</div>\n";

const shapeMap = {
  line: 'line', // 直线
  text: 'text', // 文本
  rect: 'rect', // 矩形
  path: 'path', // 路径
  brush: 'brush', // 画笔
  circle: 'circle', // 圆形
  eraser: 'eraser', // 橡皮擦
  ellipse: 'ellipse' // 椭圆
};

// 操作工具
const operationMap = {
  undo: 'undo', // 撤销
  redo: 'redo', // 重做
  move: 'move', // 移动
  save: 'save', // 保存
  clear: 'clear', // 清空
  zoomIn: 'zoomIn', // 放大
  zoomOut: 'zoomOut' // 缩小
};

// 所有工具
const toolMap = Object.assign({}, shapeMap, operationMap);

class DrawingBoard {
  constructor(options) {
    this.canvas = null; // 画布
    this.id = '#canvas';
    this.context = null; // 画布上下文

    this.textObject = null; // 文本对象
    this.activeShape = null; // 当前选中的图形
    this.canvasHistoryIndex = 0; // 画布历史记录索引
    this.canvasHistoryList = []; // 保存画布的历史记录
    this.selectedTool = shapeMap.brush; // 当前选中的工具
    this.drawingObject = null; /// 鼠标未松开时用户绘制的临时图像
    this.freeDrawingObject = null; // 自由绘制对象（画笔、橡皮）
    this.isFreeDraw = true; // 是否为自由绘制模式 （画笔、橡皮）

    this.lineSize = 1; // 线条大小
    this.fontSize = 18; // 字体大小

    this.canvasScale = 1;
    this.canvasScale = 1;
    this.canvasMaxScale = 20;
    this.canvasMinScale = 0.1;
    this.canvasScaleFactor = 0.8;

    this.downXY = {
      x: 0,
      y: 0
    };
    this.moveXY = {
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

    this.container = options.container || document.body;
    this.container.innerHTML = DrawingBoardTemplate;

    this.initCanvasSize(options);
    this.initCanvas();
    this.initEvent();
    this.initToolbar();

    this.setTool(shapeMap.brush);
  }

  initCanvas() {
    if (this.canvas) {
      return;
    }

    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setBackgroundColor(this.bgColor, undefined, {
      erasable: false
    });
    this.canvas.set('backgroundVpt', false);
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'default';
    this.canvas.renderAll();
    this.canvasHistoryIndex = 0;
    this.canvasHistoryList.push(JSON.stringify(this.canvas));
  }

  initToolbar() {
    this.toolbar = new Toolbar({
      drawingBoard: this
    });
  }

  initCanvasSize(options) {
    const { width, height } = options;
    const canvasEl = document.querySelector(this.id);
    canvasEl.width = this.width = width;
    canvasEl.height = this.height = height;
  }

  getPointer(e) {
    const { x, y } = this.canvas.getPointer(e);
    return [x, y];
  }

  initEvent() {
    console.log('this.canvas', this.canvas);
    this.canvas.on('mouse:down', this.onDown.bind(this));
    this.canvas.on('mouse:move', this.onMove.bind(this));
    this.canvas.on('mouse:up', this.onUp.bind(this));
    this.canvas.on('mouse:wheel', this.onScale.bind(this));
    this.canvas.on('after:render', this.onRenderAfter.bind(this));
    this.canvas.on('object:moving', this.onObjectMoving.bind(this));

    document.addEventListener('keyup', this.onKeyup.bind(this));
    document.addEventListener('keydown', this.onKeydown.bind(this));
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

  onDown(options) {
    if(this.selectedTool != toolMap.text && this.textObject){
      this.textObject.exitEditing();
      this.textObject.set('backgroundColor', 'rgba(0,0,0,0)');
      if (this.textObject.text == '') {
        this.canvas.remove(this.textObject);
      }
      this.canvas.renderAll();
      this.textObject = null;
    }
    
    this.setCursorStyle(this.selectedTool, 'down');

    if(this.selectedTool == toolMap.move && options.target){
      this.canvas.setActiveObject(options.target);
      return;
    }

    const [x, y] = this.getPointer(options.e);
    this.setPoint('downXY', x, y);

    if (this.selectedTool === toolMap.text) {
      this.drawText();
    } else {
      this.isDrawing = true;
    }
  }

  onMove(options) {
    if (!this.isDrawing) {
      return;
    }

    const [x, y] = this.getPointer(options.e);
    this.setPoint('moveXY', x, y);
    this.setCursorStyle(this.selectedTool, 'move');

    switch (this.selectedTool) {
      case toolMap.move:
        this.drawBoardMoving();
        break;
      case toolMap.line:
        this.drawLine();
        break;
      case toolMap.circle:
        this.drawCircle();
        break;
      case toolMap.rect:
        this.drawRectangle();
        break;
    }
  }

  onUp() {
    if (!this.isDrawing) {
      return;
    }

    
    this.isDrawing = false;
    this.drawingObject = null;
    this.resetMove();
    this.setCursorStyle(this.selectedTool);

    if (this.selectedTool == toolMap.move) {
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
    }
  }

  onScale(options) {
    const { e } = options;
    const delta = e.deltaY;

    let zoom = this.canvas.getZoom();
    zoom = Math.min(
      this.canvasMaxScale,
      Math.max(zoom * this.canvasScaleFactor ** delta, this.canvasMinScale)
    );

    this.canvas.zoomToPoint(
      {
        x: e.offsetX,
        y: e.offsetY
      },
      zoom
    );
  }

  onRenderAfter() {
    if (this.isRedoing) {
      this.isRedoing = false;
      return;
    }

    if (this.recordTimer) {
      clearTimeout(this.recordTimer);
      this.recordTimer = null;
    }

    this.recordTimer = setTimeout(() => {
      this.canvasHistoryList.push(JSON.stringify(this.canvas));
      this.canvasHistoryIndex++;
    }, 100);
  }

  onObjectMoving(options) {}

  drawLine() {
    const [x1, y1] = [this.downXY.x, this.downXY.y];
    const [x2, y2] = [this.moveXY.x, this.moveXY.y];

    const object = new fabric.Line([x1, y1, x2, y2], {
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: this.lineSize
    });

    object.selectable = false;
    if (this.drawingObject) {
      this.canvas.remove(this.drawingObject);
    }
    this.canvas.add(object);
    this.drawingObject = object;
  }

  drawText() {
    if (this.textObject) {
      this.textObject.exitEditing();
      this.textObject.set('backgroundColor', 'rgba(0,0,0,0)');
      if (this.textObject.text == '') {
        this.canvas.remove(this.textObject);
      }
      this.canvas.renderAll();
      this.textObject = null;
      return;
    }

    const [x, y] = [this.downXY.x, this.downXY.y];

    this.textObject = new fabric.Textbox('', {
      left: x,
      top: y,
      fontSize: this.fontSize,
      fill: this.strokeColor,
      hasControls: false,
      editable: true,
      width: 30,
      backgroundColor: '#fff',
      selectable: false
    });

    this.canvas.add(this.textObject);
    this.textObject.enterEditing(); // 文本打开编辑模式
    this.textObject.hiddenTextarea.focus(); // 文本编辑框获取焦点
  }

  drawBrush() {
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = this.strokeColor;
    this.canvas.freeDrawingBrush.width = parseInt(this.lineSize, 10);
  }

  drawEraser() {
    this.canvas.freeDrawingBrush = new fabric.EraserBrush(this.canvas);
    this.canvas.freeDrawingBrush.width = parseInt(this.lineSize, 10);
    this.canvas.isDrawingMode = true;
  }

  drawCircle() {
    let object = {};
    const [x1, y1] = [this.downXY.x, this.downXY.y];
    const [x2, y2] = [this.moveXY.x, this.moveXY.y];

    if (this.isShiftDown) {
      const radius =
        Math.abs(x2 - x1) < Math.abs(y2 - y1)
          ? Math.abs(x2 - x1) / 2
          : Math.abs(y2 - y1) / 2;

      const top = y2 > y1 ? y1 : y1 - radius * 2;
      const left = x2 > x1 ? x1 : x1 - radius * 2;

      object = new fabric.Circle({
        left,
        top,
        stroke: this.strokeColor,
        fill: this.fillColor,
        radius: radius,
        strokeWidth: this.lineSize,
        selectable: true
      });
    } else {
      const longAxis = Math.abs(x2 - x1) / 2;
      const shortAxis = Math.abs(y2 - y1) / 2;
      const top = y2 > y1 ? y1 : y1 - shortAxis * 2;
      const left = x2 > x1 ? x1 : x1 - longAxis * 2;

      object = new fabric.Ellipse({
        left,
        top,
        rx: longAxis,
        ry: shortAxis,
        stroke: this.strokeColor,
        fill: this.fillColor,
        strokeWidth: this.lineSize,
        selectable: true
      });
    }

    object.selectable = false;
    if (this.drawingObject) {
      this.canvas.remove(this.drawingObject);
    }
    this.canvas.add(object);
    this.drawingObject = object;
  }

  drawRectangle() {
    let object;
    const [x1, y1] = [this.downXY.x, this.downXY.y];
    const [x2, y2] = [this.moveXY.x, this.moveXY.y];

    if (this.isShiftDown) {
      const width =
        Math.abs(x2 - x1) < Math.abs(y2 - y1)
          ? Math.abs(x2 - x1)
          : Math.abs(y2 - y1);

      object = new fabric.Rect({
        left: x1,
        top: y1,
        width: width,
        height: width,
        stroke: this.strokeColor,
        fill: this.fillColor,
        strokeWidth: this.lineSize
      });
    } else {
      const width = x2 - x1;
      const height = y2 - y1;

      object = new fabric.Rect({
        left: x1,
        top: y1,
        width: width,
        height: height,
        stroke: this.strokeColor,
        fill: this.fillColor,
        strokeWidth: this.lineSize
      });
    }

    object.selectable = false;
    if (this.drawingObject) {
      this.canvas.remove(this.drawingObject);
    }
    this.canvas.add(object);
    this.drawingObject = object;
  }

  drawBoardMoving() {
    const vpt = this.canvas.viewportTransform;

    const [x1, y1] = [this.downXY.x, this.downXY.y];
    const [x2, y2] = [this.moveXY.x, this.moveXY.y];

    vpt[4] += x2 - x1;
    vpt[5] += y2 - y1;
    this.canvas.requestRenderAll();
  }

  save() {
    this.canvas.clone(cvs => {
      let top = 0;
      let left = 0;
      let width = this.canvas.width;
      let height = this.canvas.height;

      var objects = cvs.getObjects();
      if (objects.length > 0) {
        var rect = objects[0].getBoundingRect();
        var minX = rect.left;
        var minY = rect.top;
        var maxX = rect.left + rect.width;
        var maxY = rect.top + rect.height;
        for (var i = 1; i < objects.length; i++) {
          rect = objects[i].getBoundingRect();
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.left + rect.width);
          maxY = Math.max(maxY, rect.top + rect.height);
        }
        top = minY - 100;
        left = minX - 100;
        width = maxX - minX + 200;
        height = maxY - minY + 200;
        cvs.sendToBack(
          new fabric.Rect({
            left,
            top,
            width,
            height,
            stroke: 'rgba(0,0,0,0)',
            fill: this.bgColor,
            strokeWidth: 0
          })
        );
      }
      const dataURL = cvs.toDataURL({
        format: 'png',
        multiplier: cvs.getZoom(),
        left,
        top,
        width,
        height
      });
      const link = document.createElement('a');
      link.download = 'canvas.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  clear() {
    let children = this.canvas.getObjects();
    if (children.length > 0) {
      this.canvas.remove(...children);
    }
  }

  redo() {
    this.isRedoing = true;
    let index = this.canvasHistoryIndex - 1;
    if (index >= this.canvasHistoryList.length) return;

    if (this.canvasHistoryList[this.canvasHistoryIndex]) {
      this.canvas.loadFromJSON(this.canvasHistoryList[this.canvasHistoryIndex]);
      if (this.canvas.getObjects().length > 0) {
        this.canvas.getObjects().forEach(item => {
          item.set('selectable', false);
        });
      }
      this.canvasHistoryIndex = index;
    }
  }

  undo() {
    this.isRedoing = true;
    let index = this.canvasHistoryIndex - 1;
    if (index < 0) return;

    if (this.canvasHistoryList[this.canvasHistoryIndex]) {
      this.canvas.loadFromJSON(this.canvasHistoryList[this.canvasHistoryIndex]);
      if (this.canvas.getObjects().length > 0) {
        this.canvas.getObjects().forEach(item => {
          item.set('selectable', false);
        });
      }
      this.canvasHistoryIndex = index;
    }
  }

  zoomIn() {
    let zoom = this.canvas.getZoom();
    zoom *= 1.1;
    this.canvas.setZoom(zoom);
  }

  zoomOut() {
    let zoom = this.canvas.getZoom();
    zoom *= 0.9;
    this.canvas.setZoom(zoom);
  }

  setTool(tool) {
    if (tool === toolMap.undo) {
      this.undo();
      return;
    } else if (tool === toolMap.redo) {
      this.redo();
      return;
    } else if (tool === toolMap.clear) {
      this.clear();
      return;
    } else if (tool === toolMap.save) {
      this.save();
      return;
    } else if (tool === toolMap.zoomIn) {
      this.zoomIn();
      return;
    } else if (tool === toolMap.zoomOut) {
      this.zoomOut();
      return;
    }

    this.selectedTool = tool;
    this.setCursorStyle(this.selectedTool);
    this.canvas.isDrawingMode = false;
    let drawObjects = this.canvas.getObjects();

    if (drawObjects.length > 0) {
      drawObjects.map(item => {
        item.set('selectable', false);
      });
    }

    if (this.selectedTool === toolMap.brush) {
      this.drawBrush();
    } else if (this.selectedTool === toolMap.eraser) {
      this.drawEraser();
    }
  }

  resetMove() {
    this.downXY = { x: 0, y: 0 };
    this.moveXY = { x: 0, y: 0 };
  }

  setLineSize(value) {
    this.lineSize = value;

    if(this.canvas.freeDrawingBrush){
      this.canvas.freeDrawingBrush.width = parseInt(this.lineSize, 10);
    }
  }

  setFontSize(value) {
    this.fontSize = value;
  }

  setBgColor(value) {
    this.bgColor = value;
    this.canvas.setBackgroundColor(this.bgColor, undefined, {
      erasable: false
    });
    this.canvas.renderAll();
  }

  setFillColor(value) {
    this.fillColor = value;
  }

  setStrokeColor(value) {
    this.strokeColor = value;

    if(this.canvas.freeDrawingBrush){
      this.canvas.freeDrawingBrush.color = this.strokeColor;
    }
  }

  setCursorStyle(tool, status) {
    switch (tool) {
      case toolMap.brush:
        this.canvas.defaultCursor = 'crosshair';
        break;
      case toolMap.circle:
        this.canvas.defaultCursor = 'crosshair';
        break;
      case toolMap.rect:
        this.canvas.defaultCursor = 'crosshair';
        break;
      case toolMap.line:
        this.canvas.defaultCursor = 'crosshair';
        break;
      case toolMap.move:
        if (status === 'down') {
          this.canvas.defaultCursor = `grab`;
        } else if (status === 'move') {
          this.canvas.defaultCursor = `grabbing`;
        } else {
          this.canvas.defaultCursor = `all-scroll`;
        }
        break;
      case toolMap.eraser:
        this.canvas.defaultCursor = `grab`;
        break;
      default:
        this.canvas.defaultCursor = 'default';
        break;
    }
  }
}

export { DrawingBoard as default, operationMap, shapeMap, toolMap };
//# sourceMappingURL=index.js.map
