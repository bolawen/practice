function styleLoader(sourceCode) {}

styleLoader.pitch = function (remainingRequest, previousRequest, data) {
  const script = `
        import style from "!!${remainingRequest}";

        const styleEl = document.createElement('style');
        styleEl.innerHTML = style;
        document.head.appendChild(styleEl);
    `;
  return script;
};

module.exports = styleLoader;
