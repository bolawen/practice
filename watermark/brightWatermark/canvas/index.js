function cssHelper(el, prototype) {
  for (let i in prototype) {
    el.style[i] = prototype[i];
  }
}

function drawWatermark(params) {
  const { text } = params || {};
  const angle = -20;
  const canvas = document.createElement("canvas");
  canvas.width = 180;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 180, 100);
  ctx.fillStyle = "#000";
  ctx.globalAlpha = 0.1;
  ctx.font = `16px serif`;
  ctx.rotate((Math.PI / 180) * angle);
  ctx.fillText(text, 0, 50);
  return canvas.toDataURL();
}

function createWaterMark(params) {
  const { text = "水印文案" } = params || {};

  const waterMarkUrl = drawWatermark({
    text,
  });

  const waterWrapper = document.createElement("div");
  cssHelper(waterWrapper, {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
    pointerEvents: "none",
    backgroundRepeat: "repeat",
    backgroundImage: `url(${waterMarkUrl})`,
  });
  document.body.appendChild(waterWrapper);

  return waterWrapper;
}

function observeWatermark(params) {
  const { waterWrapper } = params || {};
  const config = { attributes: true, childList: true, subtree: true };

  const callback = function (mutationsList) {
    for (let mutation of mutationsList) {
      switch (mutation.type) {
        case "attributes":
          if (mutation.target === waterWrapper) {
            document.body.appendChild(waterWrapper);
            return;
          }
          break;
        case "childList":
          mutation.removedNodes.forEach(function (item) {
            if (item === waterWrapper) {
              document.body.appendChild(waterWrapper);
              return;
            }
          });
          break;
      }
    }
  };
  const targetNode = document.body;
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

const waterWrapper = createWaterMark({
  text: "柏拉文水印",
});

observeWatermark({ waterWrapper });
