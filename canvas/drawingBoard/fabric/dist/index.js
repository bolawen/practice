import { fabric } from 'https://cdn.jsdelivr.net/npm/fabric@5.3.0/+esm';

var toolbarTemplate = "<style>\n  .drawing-board-toolbar {\n    width: 100%;\n    margin-bottom: 24px;\n  }\n  .drawing-board-toolbar-container {\n    gap: 24px;\n    width: 100%;\n    display: flex;\n    align-items: center;\n    flex-wrap: wrap;\n    justify-content: flex-start;\n  }\n  .toolbar-item {\n    flex: none;\n    gap: 12px;\n    display: flex;\n    align-items: center;\n    justify-content: flex-start;\n  }\n  .toolbar-item_button.active {\n    color: #fff;\n    background-color: #384bc8;\n  }\n</style>\n\n<div class=\"drawing-board-toolbar-container\">\n  <div class=\"toolbar-item toolbar-item_stroke-color-picker\">\n    <div class=\"label\">stroke color</div>\n    <div class=\"color-picker\">\n      <input id=\"stroke-color-picker\" type=\"color\" />\n    </div>\n  </div>\n  <div class=\"toolbar-item toolbar-item_fill-color-picker\">\n    <div class=\"label\">fill color</div>\n    <div class=\"color-picker\">\n      <input id=\"fill-color-picker\" type=\"color\" />\n    </div>\n  </div>\n  <div class=\"toolbar-item toolbar-item_bg-color-picker\">\n    <div class=\"label\">bg color</div>\n    <div class=\"color-picker\">\n      <input id=\"bg-color-picker\" type=\"color\" />\n    </div>\n  </div>\n  <div class=\"toolbar-item toolbar-item_line-size\">\n    <div class=\"label\">line size:</div>\n    <div class=\"value\">1</div>\n    <input id=\"line-size\" type=\"range\" min=\"1\" max=\"100\" />\n  </div>\n  <div class=\"toolbar-item toolbar-item_font-size\">\n    <div class=\"label\">font size:</div>\n    <div class=\"value\">1</div>\n    <input id=\"font-size\" type=\"range\" min=\"1\" max=\"100\" />\n  </div>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"brush\">brush</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"line\">line</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"rect\">rect</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"circle\">circle</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"text\">text</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"move\">move</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"scale\">scale</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"undo\">undo</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"redo\">redo</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"clear\">clear</button>\n  <button class=\"toolbar-item toolbar-item_button\" id=\"save\">save</button>\n</div>\n";

class Toolbar {
  constructor(options) {
    this.options = options;
    this.container = options.container;
    this.referenceNode = options.referenceNode;

    this.initToolbar();
    this.initEvent();
    this.initValue();
  }

  initToolbar() {
    const toolbar = document.createElement('div');
    toolbar.classList.add('drawing-board-toolbar');
    this.container.insertBefore(toolbar, this.referenceNode);
    toolbar.innerHTML = toolbarTemplate;
  }

  initValue() {
    this.iniButtonActive();
    this.initValueOfSize('line-size');
    this.initValueOfSize('font-size');
    this.initValueOfColorPicker('bg-color-picker');
    this.initValueOfColorPicker('fill-color-picker');
    this.initValueOfColorPicker('stroke-color-picker');
  }

  iniButtonActive() {
    const buttonList = document.querySelectorAll(
      '.drawing-board-toolbar .toolbar-item_button'
    );
    for (let i = 0; i < buttonList.length; i++) {
      const button = buttonList[i];
      button.classList.remove('active');
      if(button.id === this.options.selectTool){
        button.classList.add('active');
      }
    }
  }

  initValueOfSize(type) {
    const typeDom = document.getElementById(type);

    switch (type) {
      case 'line-size':
        typeDom.value = this.options.sizeValue.lineSize;
        typeDom.previousElementSibling.innerHTML =
          this.options.sizeValue.lineSize;
        break;
      case 'font-size':
        typeDom.value = this.options.sizeValue.fontSize;
        typeDom.previousElementSibling.innerHTML =
          this.options.sizeValue.fontSize;
        break;
    }
  }

  initValueOfColorPicker(type) {
    const typeDom = document.getElementById(type);

    switch (type) {
      case 'bg-color-picker':
        typeDom.value = this.options.colorValue.bgColorPicker;
        break;
      case 'fill-color-picker':
        typeDom.value = this.options.colorValue.fillColorPicker;
        break;
      case 'stroke-color-picker':
        typeDom.value = this.options.colorValue.strokeColorPicker;
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
      '.drawing-board-toolbar .toolbar-item_button'
    );
    for (let i = 0; i < buttonList.length; i++) {
      buttonList[i].addEventListener('click', e => {
        const type = e.target.id;
        this.options.selectTool = type;
        this.iniButtonActive();
        this.options.updateTool(type);
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
        this.options.sizeValue.lineSize = value;
        this.options.updateSize.updateLineSize(value);
        break;
      case 'font-size':
        this.options.sizeValue.fontSize = value;
        this.options.updateSize.updateFontSize(value);
        break;
    }
  }
  updateColorPicker(node, type, value) {
    switch (type) {
      case 'bg-color-picker':
        this.options.colorValue.bgColorPicker = value;
        this.options.updateColorValue.updateBgColor(value);
        break;
      case 'fill-color-picker':
        this.options.colorValue.fillColorPicker = value;
        this.options.updateColorValue.updateFillColor(value);
        break;
      case 'stroke-color-picker':
        this.options.colorValue.strokeColorPicker = value;
        this.options.updateColorValue.updateStrokeColor(value);
        break;
    }
  }
}

const selectToolMap = {
  brush: 'brush', // 画笔
  eraser: 'eraser', // 橡皮擦
  line: 'line', // 直线
  rect: 'rect', // 矩形
  circle: 'circle', // 圆形
  text: 'text', // 文本
  move: 'move', // 移动
  scale: 'scale', // 缩放
  undo: 'undo', // 撤销
  redo: 'redo', // 重做
  clear: 'clear', // 清空
  save: 'save' // 保存
};

class FabricDrawingBoard {
  constructor(options) {
    this.id = '';
    this.width = 0;
    this.height = 0;
    this.canvas = null;
    this.container = 0;
    this.context = null;
    this.toolbar = null;

    this.stateIdx = 0; // 当前操作步数
    this.stateArr = []; // 保存画布的操作记录
    this.lineSize = 1; // 线条大小 （线条 and 线框）
    this.fontSize = 18; // 字体

    this.strokeColor = '#000000'; // 线框色
    this.showStrokeColorPicker = false; // 是否显示 线框色选择器

    this.fillColor = 'rgba(0,0,0,0)'; // 填充色
    this.showFillColorPicker = false; // 是否显示 填充色选择器

    this.bgColor = '#2F782C'; // 背景色
    this.showBgColorPicker = false; // 是否显示 背景色选择器
    this.selectTool = selectToolMap.line; // 当前用户选择的绘图工具 画笔：brush 直线：line 矩形：rect 圆形 circle 文本 text
    this.mouseFrom = {}; // 鼠标绘制起点
    this.mouseTo = {}; // 鼠标绘制重点

    this.textObject = null; // 保存用户创建的文本对象
    this.drawingObject = null; // 保存鼠标未松开时用户绘制的临时图像

    this.isDrawing = false; // 当前是否正在绘制图形（画笔，文本模式除外）
    this.isRedoing = false; // 当前是否在执行撤销或重做操作

    this.initCanvas(options);
    this.initToolbar();
    this.initCanvasEvent();
  }

  initCanvas(options) {
    this.createCanvas(options);
    // 初始化线框色 与 指示器
    this.strokeColor = '#000000';
    // 初始化填充色 与 指示器
    this.fillColor = 'rgba(0,0,0,0)';
    // 初始化背景色 与 指示器
    this.bgColor = '#2F782C';

    // 初始化 fabric canvas对象
    if (!this.canvas) {
      this.canvas = new fabric.Canvas(this.id);
      // 设置画布背景色 (背景色需要这样设置，否则拓展的橡皮功能会报错)
      this.canvas.setBackgroundColor(this.bgColor, undefined, {
        erasable: false
      });
      // 设置背景色不受缩放与平移的影响
      this.canvas.set('backgroundVpt', false);
      // 禁止用户进行组选择
      this.canvas.selection = false;
      // 设置当前鼠标停留在
      this.canvas.hoverCursor = 'default';
      // 重新渲染画布
      this.canvas.renderAll();
      // 记录画布原始状态
      this.stateArr.push(JSON.stringify(this.canvas));
      this.stateIdx = 0;
    }
  }

  initToolbar() {
    this.toolbar = new Toolbar({
      container: this.container,
      sizeValue: {
        lineSize: this.lineSize,
        fontSize: this.fontSize
      },
      updateSize: {
        updateFontSize: this.updateFontSize.bind(this),
        updateLineSize: this.updateLineSize.bind(this)
      },
      colorValue: {
        strokeColor: this.strokeColor,
        fillColor: this.fillColor,
        bgColor: this.bgColor
      },
      updateColorValue: {
        updateStrokeColor: this.updateStrokeColor.bind(this),
        updateFillColor: this.updateFillColor.bind(this),
        updateBgColor: this.updateBgColor.bind(this)
      },
      selectTool: this.selectTool,
      updateTool: this.tapToolBtn.bind(this),
      referenceNode: this.canvas.wrapperEl
    });
  }

  createCanvas(options) {
    const { id, width, height } = options;

    this.id = id || `fabric-canvas-${Math.random().toString(36).slice(2)}`;
    this.container = options.container || document.body;
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    canvas.setAttribute('id', this.id);
    canvas.width = this.width = width;
    canvas.height = this.height = height;
  }

  // 初始化橡皮擦功能
  initEraser() {
    this.canvas.freeDrawingBrush = new fabric.EraserBrush(this.canvas);
    this.canvas.freeDrawingBrush.width = parseInt(this.lineSize, 10);
    this.canvas.isDrawingMode = true;
  }

  // 初始化画布移动
  initMove() {
    var vpt = this.canvas.viewportTransform;
    vpt[4] += this.mouseTo.x - this.mouseFrom.x;
    vpt[5] += this.mouseTo.y - this.mouseFrom.y;
    this.canvas.requestRenderAll();
    this.mouseFrom.x = this.mouseTo.x;
    this.mouseFrom.y = this.mouseTo.y;
  }

  // 初始化画布事件
  initCanvasEvent() {
    // 监听鼠标按下事件
    this.canvas.on('mouse:down', options => {
      if (this.selectTool != selectToolMap.text && this.textObject) {
        // 如果当前存在文本对象，并且不是进行添加文字操作 则 退出编辑模式，并删除临时的文本对象
        // 将当前文本对象退出编辑模式
        this.textObject.exitEditing();
        this.textObject.set('backgroundColor', 'rgba(0,0,0,0)');
        if (this.textObject.text == '') {
          this.canvas.remove(this.textObject);
        }
        this.canvas.renderAll();
        this.textObject = null;
      }
      // 判断当前是否选择了集合中的操作
      if (selectToolMap[this.selectTool]) {
        // 记录当前鼠标的起点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
        this.mouseFrom.x = options.e.clientX - this.canvas._offset.left;
        this.mouseFrom.y = options.e.clientY - this.canvas._offset.top;
        // 判断当前选择的工具是否为文本
        if (this.selectTool == selectToolMap.text) {
          // 文本工具初始化
          this.initText();
        } else {
          // 设置当前正在进行绘图 或 移动操作
          this.isDrawing = true;
        }
      }
    });
    // 监听鼠标移动事件
    this.canvas.on('mouse:move', options => {
      // 如果当前正在进行绘图或移动相关操作
      if (this.isDrawing) {
        // 记录当前鼠标移动终点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
        this.mouseTo.x = options.e.clientX - this.canvas._offset.left;
        this.mouseTo.y = options.e.clientY - this.canvas._offset.top;
        switch (this.selectTool) {
          case selectToolMap.line:
            // 当前绘制直线，初始化直线绘制
            this.initLine();
            break;
          case selectToolMap.rect:
            // 初始化 矩形绘制
            this.initRect();
            break;
          case selectToolMap.circle:
            // 初始化 绘制圆形
            this.initCircle();
            break;
          case selectToolMap.move:
            // 初始化画布移动
            this.initMove();
        }
      }
    });
    // 监听鼠标松开事件
    this.canvas.on('mouse:up', () => {
      // 如果当前正在进行绘图或移动相关操作
      if (this.isDrawing) {
        // 清空鼠标移动时保存的临时绘图对象
        this.drawingObject = null;
        // 重置正在绘制图形标志
        this.isDrawing = false;
        // 清空鼠标保存记录
        this.resetMove();
        // 如果当前进行的是移动操作，鼠标松开重置当前视口缩放系数
        if (this.selectTool == selectToolMap.move) {
          this.canvas.setViewportTransform(this.canvas.viewportTransform);
        }
      }
    });
    // 监听画布渲染完成
    this.canvas.on('after:render', () => {
      if (!this.isRedoing) {
        // 当前不是进行撤销或重做操作
        // 在绘画时会频繁触发该回调，所以间隔1s记录当前状态
        if (this.recordTimer) {
          clearTimeout(this.recordTimer);
          this.recordTimer = null;
        }
        this.recordTimer = setTimeout(() => {
          this.stateArr.push(JSON.stringify(this.canvas));
          this.stateIdx++;
        }, 100);
      } else {
        // 当前正在执行撤销或重做操作，不记录重新绘制的画布
        this.isRedoing = false;
      }
    });
  }

  // 初始化画笔工具
  initBruch() {
    // 设置绘画模式画笔类型为 铅笔类型
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    // 设置画布模式为绘画模式
    this.canvas.isDrawingMode = true;
    // 设置绘画模式 画笔颜色与画笔线条大小
    this.canvas.freeDrawingBrush.color = this.strokeColor;
    this.canvas.freeDrawingBrush.width = parseInt(this.lineSize, 10);
  }

  // 初始化 绘制直线
  initLine() {
    // 根据保存的鼠标起始点坐标 创建直线对象
    let canvasObject = new fabric.Line(
      [
        this.getTransformedPosX(this.mouseFrom.x),
        this.getTransformedPosY(this.mouseFrom.y),
        this.getTransformedPosX(this.mouseTo.x),
        this.getTransformedPosY(this.mouseTo.y)
      ],
      {
        fill: this.fillColor,
        stroke: this.strokeColor,
        strokeWidth: this.lineSize
      }
    );
    // 绘制 图形对象
    this.startDrawingObject(canvasObject);
  }

  // 初始化 绘制矩形
  initRect() {
    // 计算矩形长宽
    let left = this.getTransformedPosX(this.mouseFrom.x);
    let top = this.getTransformedPosY(this.mouseFrom.y);
    let width = this.mouseTo.x - this.mouseFrom.x;
    let height = this.mouseTo.y - this.mouseFrom.y;
    // 创建矩形 对象
    let canvasObject = new fabric.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      stroke: this.strokeColor,
      fill: this.fillColor,
      strokeWidth: this.lineSize
    });
    // 绘制矩形
    this.startDrawingObject(canvasObject);
  }

  // 初始化绘制圆形
  initCircle() {
    let left = this.getTransformedPosX(this.mouseFrom.x);
    let top = this.getTransformedPosY(this.mouseFrom.y);
    // 计算圆形半径
    let radius =
      Math.sqrt(
        (this.getTransformedPosX(this.mouseTo.x) - left) *
          (this.getTransformedPosY(this.mouseTo.x) - left) +
          (this.getTransformedPosX(this.mouseTo.y) - top) *
            (this.getTransformedPosY(this.mouseTo.y) - top)
      ) / 2;
    // 创建 原型对象
    let canvasObject = new fabric.Circle({
      left: left,
      top: top,
      stroke: this.strokeColor,
      fill: this.fillColor,
      radius: radius,
      strokeWidth: this.lineSize
    });
    // 绘制圆形对象
    this.startDrawingObject(canvasObject);
  }

  // 初始化文本工具
  initText() {
    if (!this.textObject) {
      // 当前不存在绘制中的文本对象

      // 创建文本对象
      this.textObject = new fabric.Textbox('', {
        left: this.getTransformedPosX(this.mouseFrom.x),
        top: this.getTransformedPosY(this.mouseFrom.y),
        fontSize: this.fontSize,
        fill: this.strokeColor,
        hasControls: false,
        editable: true,
        width: 30,
        backgroundColor: '#fff',
        selectable: false
      });
      this.canvas.add(this.textObject);
      // 文本打开编辑模式
      this.textObject.enterEditing();
      // 文本编辑框获取焦点
      this.textObject.hiddenTextarea.focus();
    } else {
      // 将当前文本对象退出编辑模式
      this.textObject.exitEditing();
      this.textObject.set('backgroundColor', 'rgba(0,0,0,0)');
      if (this.textObject.text == '') {
        this.canvas.remove(this.textObject);
      }
      this.canvas.renderAll();
      this.textObject = null;
      return;
    }
  }

  // 绘制图形
  startDrawingObject(canvasObject) {
    // 禁止用户选择当前正在绘制的图形
    canvasObject.selectable = false;
    // 如果当前图形已绘制，清除上一次绘制的图形
    if (this.drawingObject) {
      this.canvas.remove(this.drawingObject);
    }
    // 将绘制对象添加到 canvas中
    this.canvas.add(canvasObject);
    // 保存当前绘制的图形
    this.drawingObject = canvasObject;
  }

  // 绘图工具点击选择
  tapToolBtn(tool) {
    if (tool === selectToolMap.undo) {
      this.tapHistoryBtn(-1);
      return;
    } else if (tool === selectToolMap.redo) {
      this.tapHistoryBtn(1);
      return;
    } else if (tool === selectToolMap.clear) {
      this.tapClearBtn();
      return;
    } else if (tool === selectToolMap.save) {
      this.tapSaveBtn();
      return;
    } else if (tool === selectToolMap.scale) {
      this.tapScaleBtn(1);
      return;
    }

    if (this.selectTool == tool) return;
    // 保存当前选中的绘图工具
    this.selectTool = tool;

    // 选择任何工具前进行一些重置工作
    // 禁用画笔模式
    this.canvas.isDrawingMode = false;
    // 禁止图形选择编辑
    let drawObjects = this.canvas.getObjects();
    if (drawObjects.length > 0) {
      drawObjects.map(item => {
        item.set('selectable', false);
      });
    }

    if (this.selectTool == selectToolMap.brush) {
      // 如果用户选择的是画笔工具，直接初始化，无需等待用户进行鼠标操作
      this.initBruch();
    } else if (this.selectTool == selectToolMap.eraser) {
      // 如果用户选择的是橡皮擦工具，直接初始化，无需等待用户进行鼠标操作
      this.initEraser();
    }
  }

  // 缩放按钮点击
  tapScaleBtn(flag) {
    // flag -1 缩小 1 放大
    let zoom = this.canvas.getZoom();
    if (flag > 0) {
      // 放大
      zoom *= 1.1;
    } else {
      // 缩小
      zoom *= 0.9;
    }
    // zoom 不能大于 20 不能小于0.01
    zoom = zoom > 20 ? 20 : zoom;
    zoom = zoom < 0.01 ? 0.01 : zoom;
    this.canvas.setZoom(zoom);
  }
  // 撤销重做按钮点击
  tapHistoryBtn(flag) {
    this.isRedoing = true;

    let stateIdx = this.stateIdx + flag;
    // 判断是否已经到了第一步操作
    if (stateIdx < 0) return;
    // 判断是否已经到了最后一步操作
    if (stateIdx >= this.stateArr.length) return;
    if (this.stateArr[stateIdx]) {
      this.canvas.loadFromJSON(this.stateArr[stateIdx]);
      if (this.canvas.getObjects().length > 0) {
        this.canvas.getObjects().forEach(item => {
          item.set('selectable', false);
        });
      }
      this.stateIdx = stateIdx;
    }
  }
  // 监听画布重新绘制
  tapClearBtn() {
    let children = this.canvas.getObjects();
    if (children.length > 0) {
      this.canvas.remove(...children);
    }
  }
  // 保存按钮点击
  tapSaveBtn() {
    this.canvas.clone(cvs => {
      //遍历所有对对象，获取最小坐标，最大坐标
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
  // 计算画布移动之后的x坐标点
  getTransformedPosX(x) {
    let zoom = Number(this.canvas.getZoom());
    return (x - this.canvas.viewportTransform[4]) / zoom;
  }
  getTransformedPosY(y) {
    let zoom = Number(this.canvas.getZoom());
    return (y - this.canvas.viewportTransform[5]) / zoom;
  }
  // 清空鼠标移动记录 （起点 与 终点）
  resetMove() {
    this.mouseFrom = {};
    this.mouseTo = {};
  }
  // 监听线框色选择器 颜色选择
  updateStrokeColor(val) {
    // 保存用户选择的线框色
    this.strokeColor = val;
  }
  // 监听填充色选择器 颜色选择
  updateFillColor(val) {
    // 保存用户选择的线框色
    this.fillColor = val;
  }
  // 监听背景色选择器 颜色选择
  updateBgColor(val) {
    // 保存用户选择的背景色
    this.bgColor = val;
  }
  updateFontSize(value) {
    this.lineSize = parseInt(value, 10);
  }
  updateLineSize(value) {
    this.canvas.freeDrawingBrush.width = parseInt(value, 10);
    this.lineSize = parseInt(value, 10);
  }
}

export { FabricDrawingBoard as default, selectToolMap };
//# sourceMappingURL=index.js.map
