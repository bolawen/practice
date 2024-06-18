function cssHelper(el, prototype) {
  for (let i in prototype) {
    el.style[i] = prototype[i];
  }
}

function drawWatermark(params) {
  const { text } = params || {};
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="180px" height="100px">
                <text x="0px" y="30px" dy="16px"
                    text-anchor="start"
                    stroke="#000"
                    stroke-opacity="0.1"
                    fill="none"
                    transform="rotate(-20)"
                    font-weight="100"
                    font-size="16"
                    >
                    ${text}
                </text>
            </svg>`;
  return `data:image/svg+xml;base64,${window.btoa(
    unescape(encodeURIComponent(svgStr))
  )}`;
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
