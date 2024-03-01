import { Parser } from '../dist/parser.js';
import { Tokenizer } from '../dist/tokenizer.js';

const code = `let a = function() {};`;
const tokenizer = new Tokenizer(code);
const parser = new Parser(tokenizer.tokenize());
const program = parser.parse();
console.log('program', program);
