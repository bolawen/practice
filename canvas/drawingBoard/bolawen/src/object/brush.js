import { equalPoint, midPointFrom } from '../util';

export default class Brush {
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
