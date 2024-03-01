import toolbarTemplate from './template/toolbar-template-1.html';

export default class Toolbar {
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
      default:
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
      default:
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
      }),
        false;
    }
  }

  watchSize(type) {
    const typeDom = document.getElementById(type);
    typeDom.addEventListener('input', e => {
      const { value } = e.target;
      this.updateSize(e.target, type, value);
    }),
      false;
  }

  watchColorPicker(type) {
    const typeDom = document.getElementById(type);
    typeDom.addEventListener('input', e => {
      const { value } = e.target;
      this.updateColorPicker(e.target, type, value);
    }),
      false;
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
      default:
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
      default:
        break;
    }
  }
}
