const checkbox = document.querySelector('input[type="checkbox"]');
const rangeSlider = document.querySelector('input[type="range"]');
const resizeObserverTarget = document.querySelector(".container");

const setElementWidth = (element, width) => {
  element.style.width = width + "px";
};

const resizeObserverCallbackHandler = () => {
  resizeObserverTarget.innerHTML = "元素宽度为:" + rangeSlider.value + "px";
};

const resizeObserverCallback = (entries) => {
  for (let entry of entries) {
    if (entry.contentBoxSize) {
      if (entry.contentBoxSize[0]) {
        resizeObserverCallbackHandler();
      } else {
        resizeObserverCallbackHandler();
      }
    }
  }
};

const resizeObserver = new ResizeObserver(resizeObserverCallback);
resizeObserver.observe(resizeObserverTarget);

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    resizeObserver.observe(resizeObserverTarget);
  } else {
    resizeObserver.unobserve(resizeObserverTarget);
  }
});
rangeSlider.addEventListener("input", () => {
  setElementWidth(resizeObserverTarget, rangeSlider.value);
});
