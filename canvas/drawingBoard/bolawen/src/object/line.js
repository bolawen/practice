export default class Line {
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
