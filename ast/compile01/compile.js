import { parse } from './parse.js';
import { transform } from './transform.js';
import { transformText } from './transforms/transformText.js';
import { transformElement } from './transforms/transformElement.js';

function getBaseTransformPreset() {
  return [transformText, transformElement];
}

const template = `<div id="div-id" class="div-class" v-if="isShow" @click.once="handleClick" v-for="item in list"> Hello World </div>`;
const templateAST = parse(template);

const javaScriptAST = transform(templateAST, {
  nodeTransforms: getBaseTransformPreset()
});

console.log(templateAST);
console.log(javaScriptAST);
