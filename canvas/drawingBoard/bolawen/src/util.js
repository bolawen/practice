export const downFile = (url, fileName) => {
  const x = new XMLHttpRequest();
  x.open('GET', url, true);
  x.responseType = 'blob';
  x.onload = function () {
    const url = window.URL.createObjectURL(x.response);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };
  x.send();
};

export function getRelativeOfElPosition(e, el) {
  const normalizedE = e.type.startsWith('mouse') ? e : e.targetTouches[0];
  const rect = el.getBoundingClientRect();
  let x = normalizedE.pageX - rect.left - window.scrollX;
  let y = normalizedE.pageY - rect.top - window.scrollY;
  return [x, y];
}

export const getRealPoint = (canvasScale, translateXY, x, y) => {
  x = (x - translateXY.x) / canvasScale;
  y = (y - translateXY.y) / canvasScale;

  return [x, y];
};

export function equalPoint(point1, point2) {
  return point1.x === point2.x && point1.y === point2.y;
}

export function midPointFrom(point1, point2, t = 0.5) {
  t = Math.max(Math.min(1, t), 0);
  return {
    x: point1.x + (point2.x - point1.x) * t,
    y: point1.y + (point2.y - point1.y) * t
  };
}
