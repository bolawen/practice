function loader(source) {
  console.log('normal2', source);
  return source + '//normal2';
}

loader.pitch = function () {
  console.log('normal pitch');
};

module.exports = loader;
