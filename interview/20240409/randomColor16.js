function randomColor16() {
  let r = Math.floor(Math.random() * 256).toString(16);
  let g = Math.floor(Math.random() * 256).toString(16);
  let b = Math.floor(Math.random() * 256).toString(16);

  if (r.length < 2) {
    r = "0" + r;
  }

  if (g.length < 2) {
    g = "0" + g;
  }

  if (b.length < 2) {
    b = "0" + b;
  }

  return `#${r}${g}${b}`;
}

console.log(randomColor16());

function randomColor16() {
  let r = Math.floor(Math.random() * 256).toString(16);
  let g = Math.floor(Math.random() * 256).toString(16);
  let b = Math.floor(Math.random() * 256).toString(16);

  if (r.length < 2) {
    r = "0" + r;
  }

  if (g.length < 2) {
  }
}

function randomColor() {
  const r = Math.floor(Math.random() * 256);
}
