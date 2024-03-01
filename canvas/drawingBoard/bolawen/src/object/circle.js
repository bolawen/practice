export default class Circle {
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
