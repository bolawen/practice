const jscodeShift = require("jscodeshift");

function collectLangMarks(sourceCode) {
  const langMarks = [];
  const ast = jscodeShift(sourceCode);
  const { CallExpression } = jscodeShift;

  ast
    .find(CallExpression, {
      callee: {
        name: "lang",
        type: "Identifier",
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length > 0 && args[0].type === "Literal") {
        langMarks.push(args[0].value);
      }
    });

  return langMarks;
}

const sourceCode = `
    const a = 1;
    const b = lang('为人进出的门紧锁着');
`;

const langMarks = collectLangMarks(sourceCode);
console.log(langMarks);
