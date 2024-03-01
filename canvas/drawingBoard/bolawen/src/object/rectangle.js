export default class Rectangle {
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
