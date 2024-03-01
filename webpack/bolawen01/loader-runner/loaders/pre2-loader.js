function loader(source) {
  console.log('pre2', source);
  return source + '//pre2';
}

loader.pitch = function () {
  console.log('pre2 pitch');
};

module.exports = loader;
