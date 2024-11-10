const swc = require("@swc/core");

const { parseSync, printSync } = swc;

const parse = (sourceCode) => {
  try {
    const result = parseSync(sourceCode, {
      syntax: "ecmascript",
      jsx: false,
    });
    return result;
  } catch (error) {
    console.error("Error parsing source code:", error);
    return null;
  }
};

const visit = (ast, visitor) => {
  function traverse(node, parent) {
    if (!node || typeof node !== "object") return;

    if (visitor[node.type]) {
      visitor[node.type](node, parent);
    }

    for (const key in node) {
      if (!node.hasOwnProperty(key)) continue;

      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => traverse(c, node));
      } else if (child && typeof child === "object") {
        traverse(child, node);
      }
    }
  }

  traverse(ast, null);
};

const collectLangMarks = (ast) => {
  const langMarks = [];
  visit(ast, {
    CallExpression: (node) => {
      if (
        node.callee &&
        node.callee.value === "lang" &&
        node.callee.type === "Identifier"
      ) {
        langMarks.push(node.arguments[0].expression.value);
      }
    },
  });
  return langMarks;
};

async function main() {
  const sourceCode = `var a = lang("嘻嘻"); var b = lang("哈哈"); var c = () => { var d = 3; return d;};`;
  const ast = parse(sourceCode);

  if (!ast) return;

  const langMarks = collectLangMarks(ast);
  console.log("Collected lang() marks:", langMarks);
}

main();
