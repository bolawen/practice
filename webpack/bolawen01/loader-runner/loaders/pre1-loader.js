function loader(source) {
  console.log('pre1', source);
  return source + '//pre1';
}

loader.pitch = function () {
  console.log('pre1 pitch');
};

module.exports = loader;
