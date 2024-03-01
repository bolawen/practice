class Plugin1 {
  apply(compiler) {
    compiler.hooks.run.tap('Plugin1', () => {
      console.log('Plugin1');
    });
  }
}

module.exports = Plugin1;