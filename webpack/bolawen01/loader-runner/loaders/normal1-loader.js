function loader(source) {
  console.log('normal1', source);
  return source + '//normal1';
}

loader.pitch = function () {
  console.log('normal1');
};

module.exports = loader;
