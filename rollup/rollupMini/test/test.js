const fs = require('fs');
const path = require('path');
const { rollup } = require('../dist/rollup');

const resolve = p => {
  return path.resolve(__dirname, p);
};

async function build() {
  const bundle = await rollup({
    input: resolve('./index.js')
  });
  const res = bundle.generate();
  fs.writeFileSync(resolve('./bundle.js'), res.code);
}

build();
