function cssHelper(el, prototype) {
  for (let i in prototype) {
    el.style[i] = prototype[i];
  }
}

function calculateWatermarkCount(params) {
  const { waterWidth, waterHeight } = params || {};

  const { clientWidth, clientHeight } =
    document.documentElement || document.body;

  const column = Math.ceil(clientWidth / waterWidth);
  const rows = Math.ceil(clientHeight / waterHeight);

  return column * rows;
}

function createWatermarkDiv(params) {
  const { text } = params || {};

  const div = document.createElement("div");
  div.innerHTML = text;

  cssHelper(div, {
    position: "absolute",
    top: `50px`,
    left: `50px`,
    fontSize: `16px`,
    color: "#000",
    lineHeight: 1.5,
    opacity: 0.1,
    transform: `rotate(-15deg)`,
    transformOrigin: "0 0",
    userSelect: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
  });

  return div;
}

function createWatermark(params) {
  const { text = "水印文案", waterWidth, waterHeight } = params || {};
  const waterWrapper = document.createElement("div");

  cssHelper(waterWrapper, {
    position: "fixed",
    top: "0px",
    right: "0px ",
    bottom: "0px",
    left: "0px",
    overflow: "hidden",
    display: "flex",
    "flex-wrap": "wrap",
    "pointer-events": "none",
  });

  const watermarkCount = calculateWatermarkCount({
    waterWidth,
    waterHeight,
  });

  for (let i = 0; i < watermarkCount; i++) {
    const wrap = document.createElement("div");
    cssHelper(
      wrap,
      Object.create({
        position: "relative",
        width: `${waterWidth}px`,
        height: `${waterHeight}px`,
        flex: `0 0 ${waterWidth}px`,
        overflow: "hidden",
      })
    );
    wrap.appendChild(createWatermarkDiv({ text }));
    waterWrapper.appendChild(wrap);
  }

  document.body.appendChild(waterWrapper);
  return waterWrapper;
}

function observeWatermark(params) {
  const { waterWrapper } = params || {};
  const config = { attributes: true, childList: true, subtree: true };

  const callback = function (mutationsList) {
    for (let mutation of mutationsList) {
      switch(mutation.type){
        case "attributes":
          if(mutation.target === waterWrapper){
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

const waterWrapper = createWatermark({
  text: "柏拉文水印",
  waterWidth: 180,
  waterHeight: 100,
});

observeWatermark({ waterWrapper });
