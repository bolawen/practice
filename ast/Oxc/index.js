const oxcParser = require("oxc-parser");

const { parseAsync } = oxcParser;

const parse = async (sourceCode) => {
  try {
    const result = await parseAsync(sourceCode);
    return result;
  } catch (error) {
    console.error("Error parsing source code:", error);
    return "";
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
        node.callee.name === "lang" &&
        node.callee.type === "Identifier"
      ) {
        langMarks.push(node.arguments[0].value);
      }
    },
  });

  return langMarks;
};

async function main() {
  const ast = await parse(
    `var a = lang("嘻嘻"); var b = lang("哈哈"); var c = ()=> { var d = 3; return d;};`
  );

  const langMarks = collectLangMarks(ast);
  console.log(langMarks);
}

main();
