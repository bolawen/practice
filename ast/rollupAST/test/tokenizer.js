import { Tokenizer } from '../dist/tokenizer.js';

const tokenizer = new Tokenizer('let a = function() {}');
const tokens = tokenizer.tokenize();
console.log("tokens",tokens);
