function loader(source) {
  console.log('post2', source);
  return source + '//post2';
}

loader.pitch = function () {
  console.log('post2 pitch');
};

module.exports = loader;
