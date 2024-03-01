function loader(source) {
    console.log('inline2', source);
    return source + '//inline2';
  }
  
  loader.pitch = function () {
    console.log('inline2 pitch');
  };
  
  module.exports = loader;