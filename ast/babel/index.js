const babelTypes = require("@babel/types");
const babelParser = require("@babel/parser");
const babelTraverse = require("@babel/traverse");
const babelGenerator = require("@babel/generator");

const { parse } = babelParser;
const { default: traverse } = babelTraverse;
const { default: generate } = babelGenerator;
const { functionExpression, isBlockStatement, blockStatement } = babelTypes;

const transformArrowToFunction = (sourceCode) => {
  const ast = parse(sourceCode);
  traverse(ast, {
    ArrowFunctionExpression(path) {
      const { node } = path;
      path.replaceWith(
        functionExpression(
          null,
          node.params,
          isBlockStatement(node.body)
            ? node.body
            : blockStatement([babelTypes.returnStatement(node.body)])
        )
      );

      path.node.type = "FunctionExpression";
    },
  });
  return generate(ast).code;
};

const sourceCode = `var a = lang("嘻嘻"); var b = lang("哈哈"); var c = () => { var d = 3; return d;};`;
const result = transformArrowToFunction(sourceCode);
console.log(result);
