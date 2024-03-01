export default class Toolbar {
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
      default:
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
      '.toolbar-container .toolbar-item_button'
    );
    for (let i = 0; i < buttonList.length; i++) {
      buttonList[i].addEventListener('click', e => {
        const type = e.target.id;
        this.drawingBoard.selectedTool = type;
        this.updateSelectedButton();
        this.drawingBoard.setTool(type);
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
        this.drawingBoard.setLineSize(value);
        break;
      case 'font-size':
        this.drawingBoard.setFontSize(value);
        break;
      default:
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
      default:
        break;
    }
  }
}
