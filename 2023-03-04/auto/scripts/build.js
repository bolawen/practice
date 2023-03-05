const rollup = require("rollup");

const rollupOptions = require("./config");
const inputOptions = { ...rollupOptions };
const outputOptions = { ...rollupOptions.output };
const watchOptions = {
  ...inputOptions,
  output: [outputOptions],
};

async function build() {
  const bundle = await rollup.rollup(inputOptions);
  await bundle.write(outputOptions);
  rollup.watch(watchOptions);
}

build();

