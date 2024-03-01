export default class Ellipse {
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
