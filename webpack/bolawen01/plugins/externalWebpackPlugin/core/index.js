const pluginName = 'ExternalWebpackPlugin';
const { ExternalModule } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function importHandler(parser) {
  parser.hooks.import.tap(pluginName, (statement, source) => {
    if (this.transformLibrary.includes(source)) {
      this.usedLibrary.add(source);
    }
  });
}

function requireHandler(parser) {
  parser.hooks.call.for('require').tap(pluginName, expression => {
    const moduleName = expression.arguments[0].value;
    if (this.transformLibrary.includes(moduleName)) {
      this.usedLibrary.add(moduleName);
    }
  });
}

class ExternalWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.usedLibrary = new Set();
    this.transformLibrary = Object.keys(options);
  }

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(pluginName, normalModuleFactory => {
      normalModuleFactory.hooks.factorize.tapAsync(
        pluginName,
        (resolveData, callback) => {
          const requireModuleName = resolveData.request;
          if (this.transformLibrary.includes(requireModuleName)) {
            const externalModuleName =
              this.options[requireModuleName].variableName;
            callback(
              null,
              new ExternalModule(
                externalModuleName,
                'window',
                externalModuleName
              )
            );
          } else {
            callback();
          }
        }
      );

      normalModuleFactory.hooks.parser
        .for('javascript/auto')
        .tap(pluginName, parser => {
          importHandler.call(this, parser);
          requireHandler.call(this, parser);
        });
    });

    compiler.hooks.compilation.tap(pluginName, compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
        pluginName,
        data => {
          const scriptTag = data.assetTags.scripts;
          this.usedLibrary.forEach(library => {
            scriptTag.unshift({
              voidTag: false,
              tagName: 'script',
              attributes: {
                defer: true,
                type: undefined,
                src: this.options[library].src
              },
              meta: { plugin: pluginName }
            });
          });
        }
      );
    });
  }
}

module.exports = ExternalWebpackPlugin;
