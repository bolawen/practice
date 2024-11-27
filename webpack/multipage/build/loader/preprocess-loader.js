const { preprocess } = require("preprocess");

const defaultOptions = {
  context: {
    mode: "development",
  },
};

module.exports = function (source) {
  const options = Object.assign({}, defaultOptions, this.getOptions());

  const type = this.resourcePath.split(".").pop();
  const config = { type: type };

  return new Promise((resolve, reject) => {
    try {
      source = preprocess(source, options.context, config);

      resolve(source);
    } catch (error) {
      reject(error);
    }
  });
};
