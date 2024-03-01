function initCustomFormatter() {
  const formatter = {
    header(obj) {
      return ['div', {}, `${JSON.stringify(obj, null, 7)}`];
    },
    hasBody(obj) {
      return false;
    },
    body(obj) {
      return false;
    }
  };

  if (window.devtoolsFormatters) {
    window.devtoolsFormatters.push(formatter);
  } else {
    window.devtoolsFormatters = [formatter];
  }
}

initCustomFormatter();

const obj = {
  a: 1,
  b: 2
};
console.log(obj);
