import { shapeMap } from './index';

function isInnerRectangle(x0, y0, width, height, x, y) {
  return x0 <= x && y0 <= y && x0 + width >= x && y0 + height >= y;
}

function isInnerCircle(x0, y0, r, x, y) {
  return Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2) <= Math.pow(r, 2);
}

function isInnerPath(x0, y0, x1, y1, x, y, lineWidth) {
  var a1pow = Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2);
  var a1 = Math.sqrt(a1pow, 2);
  var a2pow = Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2);
  var a2 = Math.sqrt(a2pow, 2);

  var a3pow = Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2);
  var a3 = Math.sqrt(a3pow, 2);

  var r = lineWidth / 2;
  var ab = (a1pow - a2pow + a3pow) / (2 * a3);
  var h = Math.sqrt(a1pow - Math.pow(ab, 2), 2);

  var ad = Math.sqrt(Math.pow(a3, 2) + Math.pow(r, 2));

  return h <= r && a1 <= ad && a2 <= ad;
}

export function findActiveShape(data, x, y) {
  let activeShape = null;

  for (let item of data) {
    switch (item.type) {
      case shapeMap.line:
        const lineNumber = item.data.length / 2 - 1;
        let flag = false;
        for (let i = 0; i < lineNumber; i++) {
          let index = i * 2;
          flag = isInnerPath(
            item.data[index],
            item.data[index + 1],
            item.data[index + 2],
            item.data[index + 3],
            x,
            y,
            item.lineWidth || 1
          );
          if (flag) {
            activeShape = item;
            break;
          }
        }
        break;
      case shapeMap.circle:
        isInnerCircle(...item.data, x, y) && (activeShape = item);
        break;
      case shapeMap.rectangle:
        isInnerRectangle(...item.data, x, y) && (activeShape = item);
        break;
    }
  }

  return activeShape;
}
