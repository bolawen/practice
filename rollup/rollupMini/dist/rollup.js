"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve3, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve3(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/rollup.ts
var rollup_exports = {};
__export(rollup_exports, {
  rollup: () => rollup
});
module.exports = __toCommonJS(rollup_exports);
var import_node_fs = __toESM(require("fs"));

// src/utils/object.ts
var keys = Object.keys;
var values = Object.values;

// src/graph.ts
var import_path2 = require("path");

// src/module.ts
var import_magic_string = __toESM(require("magic-string"));

// src/ast/declaration.ts
var Declaration = class {
  constructor(node, isParam, statement) {
    this.isFunctionDeclaration = false;
    this.name = null;
    this.isParam = false;
    this.isUsed = false;
    this.isReassigned = false;
    if (node) {
      if (node.type === "FunctionDeclaration") {
        this.isFunctionDeclaration = true;
        this.functionNode = node;
      } else if (node.type === "VariableDeclarator" && node.init && /FunctionExpression/.test(node.init.type)) {
        this.isFunctionDeclaration = true;
        this.functionNode = node.init;
      }
    }
    this.statement = statement;
    this.isParam = isParam;
  }
  addReference(reference) {
    reference.declaration = this;
    this.name = reference.name;
  }
  use() {
    this.isUsed = true;
    if (this.statement) {
      this.statement.mark();
    }
  }
  render() {
    return this.name;
  }
};
var SyntheticDefaultDeclaration = class extends Declaration {
  constructor(node, name, statement) {
    super(node, false, statement);
    this.original = null;
    this.exportName = "";
    this.name = name;
  }
  render() {
    var _a;
    return ((_a = this.original) == null ? void 0 : _a.render()) || this.name;
  }
  bind(declaration) {
    this.original = declaration;
  }
};
var SyntheticNamespaceDeclaration = class extends Declaration {
  constructor(module2) {
    super(null, false, null);
    this.originals = {};
    this.needsNamespaceBlock = false;
    this.module = module2;
    module2.getExports().forEach((name) => {
      const declaration = module2.traceExport(name);
      if (declaration) {
        this.originals[name] = declaration;
      }
    });
  }
  addReference(reference) {
    if (!this.needsNamespaceBlock) {
      this.needsNamespaceBlock = true;
    }
    if (reference.objectPaths.length) {
      const ref = reference.objectPaths.shift();
      reference.name = ref.name;
      reference.start = ref.start;
      reference.end = ref.end;
    }
    values(this.originals).forEach((declaration) => {
      declaration.addReference(reference);
    });
    super.addReference(reference);
  }
  renderBlock(intentString = "  ") {
    const members = keys(this.originals).map((name) => {
      const originDeclaration = this.originals[name];
      return `${intentString}${name}: ${originDeclaration.render()}`;
    }).join(",\n");
    return `const ${this.render()} = Object.freeze({
${members}
});`;
  }
  use() {
    for (const original of values(this.originals)) {
      original.use();
    }
  }
};

// src/ast/scope.ts
var Scope = class {
  constructor(options) {
    this.declarations = {};
    const { parent, paramNodes, block, statement } = options;
    this.parent = parent;
    this.paramNodes = paramNodes || [];
    this.statement = statement;
    this.isBlockScope = !!block;
    this.paramNodes.forEach(
      (node) => this.declarations[node.name] = new Declaration(
        node,
        true,
        this.statement
      )
    );
  }
  addDeclaration(node, isBlockDeclaration) {
    if (this.isBlockScope && !isBlockDeclaration && this.parent) {
      this.parent.addDeclaration(node, isBlockDeclaration);
      return;
    }
    const key = node.id && node.id.name;
    this.declarations[key] = new Declaration(node, false, this.statement);
  }
  eachDeclaration(fn) {
    keys(this.declarations).forEach((key) => {
      fn(key, this.declarations[key]);
    });
  }
  contains(name) {
    return this.findDeclaration(name);
  }
  findDeclaration(name) {
    return this.declarations[name] || this.parent && this.parent.findDeclaration(name);
  }
};

// src/utils/walk.ts
var shouldSkip;
var shouldAbort;
function walk(ast, { enter, leave }) {
  shouldAbort = false;
  visit(ast, null, enter, leave);
}
var context = {
  skip: () => shouldSkip = true,
  abort: () => shouldAbort = true
};
var childKeys = {};
var toString = Object.prototype.toString;
function isArray(thing) {
  return toString.call(thing) === "[object Array]";
}
function visit(node, parent, enter, leave, prop) {
  if (!node || shouldAbort)
    return;
  if (enter) {
    shouldSkip = false;
    enter.call(context, node, parent, prop);
    if (shouldSkip || shouldAbort)
      return;
  }
  let keys2 = childKeys[node.type] || (childKeys[node.type] = Object.keys(node).filter(
    (key2) => typeof node[key2] === "object"
  ));
  let key, value;
  for (let i = 0; i < keys2.length; i++) {
    key = keys2[i];
    value = node[key];
    if (isArray(value)) {
      for (let j = 0; j < value.length; j++) {
        visit(value[j], node, enter, leave, key);
      }
    } else if (value && value.type) {
      visit(value, node, enter, leave, key);
    }
  }
  if (leave && !shouldAbort) {
    leave(node, parent, prop);
  }
}

// ../../ast/rollupAST/src/utils.ts
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function isAlpha(char) {
  return char >= "a" && char <= "z" || char >= "A" && char <= "Z";
}
function isDigit(char) {
  return char >= "0" && char <= "9";
}
function isUnderline(char) {
  return char === "_";
}

// ../../ast/rollupAST/src/tokenizer.ts
var TOKENS_GENERATOR = {
  let(start) {
    return { type: "Let" /* Let */, value: "let", start, end: start + 3 };
  },
  const(start) {
    return { type: "Const" /* Const */, value: "const", start, end: start + 5 };
  },
  var(start) {
    return { type: "Var" /* Var */, value: "var", start, end: start + 3 };
  },
  assign(start) {
    return { type: "Assign" /* Assign */, value: "=", start, end: start + 1 };
  },
  import(start) {
    return {
      type: "Import" /* Import */,
      value: "import",
      start,
      end: start + 6
    };
  },
  export(start) {
    return {
      type: "Export" /* Export */,
      value: "export",
      start,
      end: start + 6
    };
  },
  from(start) {
    return {
      type: "From" /* From */,
      value: "from",
      start,
      end: start + 4
    };
  },
  as(start) {
    return {
      type: "As" /* As */,
      value: "as",
      start,
      end: start + 2
    };
  },
  asterisk(start) {
    return {
      type: "Asterisk" /* Asterisk */,
      value: "*",
      start,
      end: start + 1
    };
  },
  default(start) {
    return {
      type: "Default" /* Default */,
      value: "default",
      start,
      end: start + 7
    };
  },
  number(start, value) {
    return {
      type: "Number" /* Number */,
      value,
      start,
      end: start + value.length,
      raw: value
    };
  },
  function(start) {
    return {
      type: "Function" /* Function */,
      value: "function",
      start,
      end: start + 8
    };
  },
  return(start) {
    return {
      type: "Return" /* Return */,
      value: "return",
      start,
      end: start + 6
    };
  },
  operator(start, value) {
    return {
      type: "Operator" /* Operator */,
      value,
      start,
      end: start + value.length
    };
  },
  comma(start) {
    return {
      type: "Comma" /* Comma */,
      value: ",",
      start,
      end: start + 1
    };
  },
  leftParen(start) {
    return { type: "LeftParen" /* LeftParen */, value: "(", start, end: start + 1 };
  },
  rightParen(start) {
    return { type: "RightParen" /* RightParen */, value: ")", start, end: start + 1 };
  },
  leftCurly(start) {
    return { type: "LeftCurly" /* LeftCurly */, value: "{", start, end: start + 1 };
  },
  rightCurly(start) {
    return { type: "RightCurly" /* RightCurly */, value: "}", start, end: start + 1 };
  },
  dot(start) {
    return { type: "Dot" /* Dot */, value: ".", start, end: start + 1 };
  },
  semicolon(start) {
    return { type: "Semicolon" /* Semicolon */, value: ";", start, end: start + 1 };
  },
  stringLiteral(start, value, raw) {
    return {
      type: "StringLiteral" /* StringLiteral */,
      value,
      start,
      end: start + value.length + 2,
      raw
    };
  },
  identifier(start, value) {
    return {
      type: "Identifier" /* Identifier */,
      value,
      start,
      end: start + value.length
    };
  }
};
var KNOWN_SINGLE_CHAR_TOKENS = /* @__PURE__ */ new Map([
  ["(", TOKENS_GENERATOR.leftParen],
  [")", TOKENS_GENERATOR.rightParen],
  ["{", TOKENS_GENERATOR.leftCurly],
  ["}", TOKENS_GENERATOR.rightCurly],
  [".", TOKENS_GENERATOR.dot],
  [";", TOKENS_GENERATOR.semicolon],
  [",", TOKENS_GENERATOR.comma],
  ["*", TOKENS_GENERATOR.asterisk],
  ["=", TOKENS_GENERATOR.assign]
]);
var QUOTATION_TOKENS = ["'", '"', "`"];
var OPERATOR_TOKENS = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "^",
  "&",
  "|",
  "~",
  "<<",
  ">>"
];
var Tokenizer = class {
  constructor(input) {
    this._tokens = [];
    this._currentIndex = 0;
    this._scanMode = 0 /* Normal */;
    this._source = input;
  }
  scanIndentifier() {
    this._setScanMode(1 /* Identifier */);
    let identifier = "";
    let currentChar = this._getCurrentChar();
    const startIndex = this._currentIndex;
    while (isAlpha(currentChar) || isDigit(currentChar) || isUnderline(currentChar)) {
      identifier += currentChar;
      this._currentIndex++;
      currentChar = this._getCurrentChar();
    }
    let token;
    if (identifier in TOKENS_GENERATOR) {
      token = TOKENS_GENERATOR[identifier](
        startIndex
      );
    } else {
      token = TOKENS_GENERATOR["identifier"](startIndex, identifier);
    }
    this._tokens.push(token);
    this._resetScanMode();
  }
  scanStringLiteral() {
    this._setScanMode(2 /* StringLiteral */);
    const startIndex = this._currentIndex;
    let currentChar = this._getCurrentChar();
    const startQuotation = currentChar;
    this._currentIndex++;
    let str = "";
    currentChar = this._getCurrentChar();
    while (currentChar && currentChar !== startQuotation) {
      str += currentChar;
      this._currentIndex++;
      currentChar = this._getCurrentChar();
    }
    const token = TOKENS_GENERATOR.stringLiteral(
      startIndex,
      str,
      `${startQuotation}${str}${startQuotation}`
    );
    this._tokens.push(token);
    this._resetScanMode();
  }
  _scanNumber() {
    this._setScanMode(3 /* Number */);
    const startIndex = this._currentIndex;
    let number = "";
    let currentChar = this._getCurrentChar();
    let isFloat = false;
    while (isDigit(currentChar) || currentChar === "." && !isFloat) {
      if (currentChar === ".") {
        isFloat = true;
      }
      number += currentChar;
      this._currentIndex++;
      currentChar = this._getCurrentChar();
    }
    if (isFloat && currentChar === ".") {
      throw new Error('Unexpected character "."');
    }
    const token = TOKENS_GENERATOR.number(startIndex, number);
    this._tokens.push(token);
    this._resetScanMode();
  }
  tokenize() {
    while (this._currentIndex < this._source.length) {
      let currentChar = this._source[this._currentIndex];
      const startIndex = this._currentIndex;
      if (isWhiteSpace(currentChar)) {
        this._currentIndex++;
        continue;
      } else if (isAlpha(currentChar)) {
        this.scanIndentifier();
        continue;
      } else if (KNOWN_SINGLE_CHAR_TOKENS.has(currentChar)) {
        if (currentChar === "*") {
          const previousToken = this._getPreviousToken();
          if (previousToken.type !== "Import" /* Import */ && previousToken.type !== "Export" /* Export */) {
            this._tokens.push(
              TOKENS_GENERATOR.operator(startIndex, currentChar)
            );
            this._currentIndex++;
            continue;
          }
        }
        const token = KNOWN_SINGLE_CHAR_TOKENS.get(
          currentChar
        )(startIndex);
        this._tokens.push(token);
        this._currentIndex++;
      } else if (QUOTATION_TOKENS.includes(currentChar)) {
        this.scanStringLiteral();
        this._currentIndex++;
        continue;
      } else if (OPERATOR_TOKENS.includes(currentChar) && this._scanMode === 0 /* Normal */) {
        this._tokens.push(TOKENS_GENERATOR.operator(startIndex, currentChar));
        this._currentIndex++;
        continue;
      } else if (OPERATOR_TOKENS.includes(currentChar + this._getNextChar()) && this._scanMode === 0 /* Normal */) {
        this._tokens.push(
          TOKENS_GENERATOR.operator(
            startIndex,
            currentChar + this._getNextChar()
          )
        );
        this._currentIndex += 2;
        continue;
      } else if (isDigit(currentChar)) {
        this._scanNumber();
        continue;
      }
    }
    this._resetCurrentIndex();
    return this._getTokens();
  }
  _getCurrentChar() {
    return this._source[this._currentIndex];
  }
  _getNextChar() {
    if (this._currentIndex + 1 < this._source.length) {
      return this._source[this._currentIndex + 1];
    }
    return "";
  }
  _resetCurrentIndex() {
    this._currentIndex = 0;
  }
  _getTokens() {
    return this._tokens;
  }
  _getPreviousToken() {
    if (this._tokens.length > 0) {
      return this._tokens[this._tokens.length - 1];
    }
    throw new Error("Previous token not found");
  }
  _setScanMode(mode) {
    this._scanMode = mode;
  }
  _resetScanMode() {
    this._scanMode = 0 /* Normal */;
  }
};

// ../../ast/rollupAST/src/parser.ts
var Parser = class {
  constructor(token) {
    this._tokens = [];
    this._currentIndex = 0;
    this._tokens = [...token];
  }
  parse() {
    const program = this._parseProgram();
    return program;
  }
  _parseProgram() {
    const program = {
      type: "Program" /* Program */,
      body: [],
      start: 0,
      end: Infinity
    };
    while (!this._isEnd()) {
      const node = this._parseStatement();
      program.body.push(node);
      if (this._isEnd()) {
        program.end = node.end;
      }
    }
    return program;
  }
  _parseStatement() {
    if (this._checkCurrentTokenType("Function" /* Function */)) {
      return this._parseFunctionDeclaration();
    } else if (this._checkCurrentTokenType("Identifier" /* Identifier */)) {
      return this._parseExpressionStatement();
    } else if (this._checkCurrentTokenType("LeftCurly" /* LeftCurly */)) {
      return this._parseBlockStatement();
    } else if (this._checkCurrentTokenType("Return" /* Return */)) {
      return this._parseReturnStatement();
    } else if (this._checkCurrentTokenType("Import" /* Import */)) {
      return this._parseImportStatement();
    } else if (this._checkCurrentTokenType("Export" /* Export */)) {
      return this._parseExportStatement();
    } else if (this._checkCurrentTokenType([
      "Let" /* Let */,
      "Var" /* Var */,
      "Const" /* Const */
    ])) {
      return this._parseVariableDeclaration();
    }
    console.log(this._getCurrentToken());
    throw new Error("Unexpected token");
  }
  _parseImportStatement() {
    const { start } = this._getCurrentToken();
    const specifiers = [];
    this._goNext("Import" /* Import */);
    if (this._checkCurrentTokenType("Identifier" /* Identifier */)) {
      const local = this._parseIdentifier();
      const defaultSpecifier = {
        type: "ImportDefaultSpecifier" /* ImportDefaultSpecifier */,
        local,
        start: local.start,
        end: local.end
      };
      specifiers.push(defaultSpecifier);
      if (this._checkCurrentTokenType("Comma" /* Comma */)) {
        this._goNext("Comma" /* Comma */);
      }
    }
    if (this._checkCurrentTokenType("LeftCurly" /* LeftCurly */)) {
      this._goNext("LeftCurly" /* LeftCurly */);
      while (!this._checkCurrentTokenType("RightCurly" /* RightCurly */)) {
        const specifier = this._parseIdentifier();
        let local = null;
        if (this._checkCurrentTokenType("As" /* As */)) {
          this._goNext("As" /* As */);
          local = this._parseIdentifier();
        }
        const importSpecifier = {
          type: "ImportSpecifier" /* ImportSpecifier */,
          imported: specifier,
          local: local ? local : specifier,
          start: specifier.start,
          end: local ? local.end : specifier.end
        };
        specifiers.push(importSpecifier);
        if (this._checkCurrentTokenType("Comma" /* Comma */)) {
          this._goNext("Comma" /* Comma */);
        }
      }
      this._goNext("RightCurly" /* RightCurly */);
    } else if (this._checkCurrentTokenType("Asterisk" /* Asterisk */)) {
      const { start: start2 } = this._getCurrentToken();
      this._goNext("Asterisk" /* Asterisk */);
      this._goNext("As" /* As */);
      const local = this._parseIdentifier();
      const importNamespaceSpecifier = {
        type: "ImportNamespaceSpecifier" /* ImportNamespaceSpecifier */,
        local,
        start: start2,
        end: local.end
      };
      specifiers.push(importNamespaceSpecifier);
    }
    if (this._checkCurrentTokenType("From" /* From */)) {
      this._goNext("From" /* From */);
    }
    const source = this._parseLiteral();
    const node = {
      type: "ImportDeclaration" /* ImportDeclaration */,
      specifiers,
      start,
      end: source.end,
      source
    };
    this._skipSemicolon();
    return node;
  }
  _parseExportStatement() {
    const { start } = this._getCurrentToken();
    let exportDeclaration = null;
    const specifiers = [];
    this._goNext("Export" /* Export */);
    if (this._checkCurrentTokenType("Default" /* Default */)) {
      this._goNext("Default" /* Default */);
      if (this._checkCurrentTokenType("Identifier" /* Identifier */)) {
        const local = this._parseExpression();
        exportDeclaration = {
          type: "ExportDefaultDeclaration" /* ExportDefaultDeclaration */,
          declaration: local,
          start: local.start,
          end: local.end
        };
      } else if (this._checkCurrentTokenType("Function" /* Function */)) {
        const declaration = this._parseFunctionDeclaration();
        exportDeclaration = {
          type: "ExportDefaultDeclaration" /* ExportDefaultDeclaration */,
          declaration,
          start,
          end: declaration.end
        };
      }
    } else if (this._checkCurrentTokenType("LeftCurly" /* LeftCurly */)) {
      this._goNext("LeftCurly" /* LeftCurly */);
      while (!this._checkCurrentTokenType("RightCurly" /* RightCurly */)) {
        const local = this._parseIdentifier();
        let exported = local;
        if (this._checkCurrentTokenType("As" /* As */)) {
          this._goNext("As" /* As */);
          exported = this._parseIdentifier();
        }
        const exportSpecifier = {
          type: "ExportSpecifier" /* ExportSpecifier */,
          local,
          exported,
          start: local.start,
          end: exported.end
        };
        specifiers.push(exportSpecifier);
        if (this._checkCurrentTokenType("Comma" /* Comma */)) {
          this._goNext("Comma" /* Comma */);
        }
      }
      this._goNext("RightCurly" /* RightCurly */);
      if (this._checkCurrentTokenType("From" /* From */)) {
        this._goNext("From" /* From */);
      }
      const source = this._parseLiteral();
      exportDeclaration = {
        type: "ExportNamedDeclaration" /* ExportNamedDeclaration */,
        specifiers,
        start,
        declaration: null,
        end: source.end,
        source
      };
    } else if (this._checkCurrentTokenType([
      "Const" /* Const */,
      "Let" /* Let */,
      "Var" /* Var */
    ])) {
      const declaration = this._parseVariableDeclaration();
      exportDeclaration = {
        type: "ExportNamedDeclaration" /* ExportNamedDeclaration */,
        declaration,
        start,
        end: declaration.end,
        specifiers,
        source: null
      };
      return exportDeclaration;
    } else if (this._checkCurrentTokenType("Function" /* Function */)) {
      const declaration = this._parseFunctionDeclaration();
      exportDeclaration = {
        type: "ExportNamedDeclaration" /* ExportNamedDeclaration */,
        declaration,
        start,
        end: declaration.end,
        specifiers,
        source: null
      };
    } else {
      this._goNext("Asterisk" /* Asterisk */);
      let exported = null;
      if (this._checkCurrentTokenType("As" /* As */)) {
        this._goNext("As" /* As */);
        exported = this._parseIdentifier();
      }
      this._goNext("From" /* From */);
      const source = this._parseLiteral();
      exportDeclaration = {
        type: "ExportAllDeclaration" /* ExportAllDeclaration */,
        start,
        end: source.end,
        source,
        exported
      };
    }
    if (!exportDeclaration) {
      throw new Error("Export declaration cannot be parsed");
    }
    this._skipSemicolon();
    return exportDeclaration;
  }
  _parseVariableDeclaration() {
    const { start } = this._getCurrentToken();
    const kind = this._getCurrentToken().value;
    this._goNext(["Let" /* Let */, "Var" /* Var */, "Const" /* Const */]);
    const declarations = [];
    const isVariableDeclarationEnded = () => {
      if (this._checkCurrentTokenType("Semicolon" /* Semicolon */)) {
        return true;
      }
      const nextToken = this._getNextToken();
      if (nextToken && nextToken.type === "Assign" /* Assign */) {
        return false;
      }
      return true;
    };
    while (!isVariableDeclarationEnded()) {
      const id = this._parseIdentifier();
      let init = null;
      if (this._checkCurrentTokenType("Assign" /* Assign */)) {
        this._goNext("Assign" /* Assign */);
        if (this._checkCurrentTokenType([
          "Number" /* Number */,
          "StringLiteral" /* StringLiteral */
        ])) {
          init = this._parseLiteral();
        } else {
          init = this._parseExpression();
        }
      }
      const declarator = {
        type: "VariableDeclarator" /* VariableDeclarator */,
        id,
        init,
        start: id.start,
        end: init ? init.end : id.end
      };
      declarations.push(declarator);
      if (this._checkCurrentTokenType("Comma" /* Comma */)) {
        this._goNext("Comma" /* Comma */);
      }
    }
    const node = {
      type: "VariableDeclaration" /* VariableDeclaration */,
      kind,
      declarations,
      start,
      end: this._getPreviousToken().end
    };
    this._skipSemicolon();
    return node;
  }
  _parseReturnStatement() {
    const { start } = this._getCurrentToken();
    this._goNext("Return" /* Return */);
    const argument = this._parseExpression();
    const node = {
      type: "ReturnStatement" /* ReturnStatement */,
      argument,
      start,
      end: argument.end
    };
    this._skipSemicolon();
    return node;
  }
  _parseExpressionStatement() {
    const expression = this._parseExpression();
    const expressionStatement = {
      type: "ExpressionStatement" /* ExpressionStatement */,
      expression,
      start: expression.start,
      end: expression.end
    };
    return expressionStatement;
  }
  // 需要考虑 a.b.c 嵌套结构
  _parseExpression() {
    if (this._checkCurrentTokenType("Function" /* Function */)) {
      return this._parseFunctionExpression();
    }
    if (this._checkCurrentTokenType(["Number" /* Number */, "StringLiteral" /* StringLiteral */])) {
      return this._parseLiteral();
    }
    let expresion = this._parseIdentifier();
    while (!this._isEnd()) {
      if (this._checkCurrentTokenType("LeftParen" /* LeftParen */)) {
        expresion = this._parseCallExpression(expresion);
      } else if (this._checkCurrentTokenType("Dot" /* Dot */)) {
        expresion = this._parseMemberExpression(expresion);
      } else if (this._checkCurrentTokenType("Operator" /* Operator */)) {
        expresion = this.__parseBinaryOperatorExpression(expresion);
      } else {
        break;
      }
    }
    return expresion;
  }
  __parseBinaryOperatorExpression(expression) {
    const { start } = this._getCurrentToken();
    const operator = this._getCurrentToken().value;
    this._goNext("Operator" /* Operator */);
    const right = this._parseExpression();
    const node = {
      type: "BinaryExpression" /* BinaryExpression */,
      operator,
      left: expression,
      right,
      start,
      end: right.end
    };
    return node;
  }
  _parseMemberExpression(object) {
    this._goNext("Dot" /* Dot */);
    const property = this._parseIdentifier();
    const node = {
      type: "MemberExpression" /* MemberExpression */,
      object,
      property,
      start: object.start,
      end: property.end,
      computed: false
    };
    return node;
  }
  _parseCallExpression(callee) {
    const args = this._parseParams(1 /* CallExpression */);
    const { end } = this._getPreviousToken();
    const node = {
      type: "CallExpression" /* CallExpression */,
      callee,
      arguments: args,
      start: callee.start,
      end
    };
    this._skipSemicolon();
    return node;
  }
  _parseFunctionDeclaration() {
    const { start } = this._getCurrentToken();
    this._goNext("Function" /* Function */);
    let id = null;
    if (this._checkCurrentTokenType("Identifier" /* Identifier */)) {
      id = this._parseIdentifier();
    }
    const params = this._parseParams();
    const body = this._parseBlockStatement();
    const node = {
      type: "FunctionDeclaration" /* FunctionDeclaration */,
      id,
      params,
      body,
      start,
      end: body.end
    };
    return node;
  }
  _parseFunctionExpression() {
    const { start } = this._getCurrentToken();
    this._goNext("Function" /* Function */);
    let id = null;
    if (this._checkCurrentTokenType("Identifier" /* Identifier */)) {
      id = this._parseIdentifier();
    }
    const params = this._parseParams();
    const body = this._parseBlockStatement();
    const node = {
      type: "FunctionExpression" /* FunctionExpression */,
      id,
      params,
      body,
      start,
      end: body.end
    };
    return node;
  }
  _parseParams(mode = 0 /* FunctionDeclaration */) {
    this._goNext("LeftParen" /* LeftParen */);
    const params = [];
    while (!this._checkCurrentTokenType("RightParen" /* RightParen */)) {
      let param = mode === 0 /* FunctionDeclaration */ ? (
        // 函数声明
        this._parseIdentifier()
      ) : (
        // 函数调用
        this._parseExpression()
      );
      params.push(param);
      if (!this._checkCurrentTokenType("RightParen" /* RightParen */)) {
        this._goNext("Comma" /* Comma */);
      }
    }
    this._goNext("RightParen" /* RightParen */);
    return params;
  }
  _parseLiteral() {
    const token = this._getCurrentToken();
    let value = token.value;
    if (token.type === "Number" /* Number */) {
      value = Number(value);
    }
    const literal = {
      type: "Literal" /* Literal */,
      value: token.value,
      start: token.start,
      end: token.end,
      raw: token.raw
    };
    this._goNext(token.type);
    return literal;
  }
  _parseIdentifier() {
    const token = this._getCurrentToken();
    const identifier = {
      type: "Identifier" /* Identifier */,
      name: token.value,
      start: token.start,
      end: token.end
    };
    this._goNext("Identifier" /* Identifier */);
    return identifier;
  }
  _parseBlockStatement() {
    const { start } = this._getCurrentToken();
    const blockStatement = {
      type: "BlockStatement" /* BlockStatement */,
      body: [],
      start,
      end: Infinity
    };
    this._goNext("LeftCurly" /* LeftCurly */);
    while (!this._checkCurrentTokenType("RightCurly" /* RightCurly */)) {
      const node = this._parseStatement();
      blockStatement.body.push(node);
    }
    blockStatement.end = this._getCurrentToken().end;
    this._goNext("RightCurly" /* RightCurly */);
    return blockStatement;
  }
  _checkCurrentTokenType(type) {
    if (this._isEnd()) {
      return false;
    }
    const currentToken = this._tokens[this._currentIndex];
    if (Array.isArray(type)) {
      return type.includes(currentToken.type);
    } else {
      return currentToken.type === type;
    }
  }
  _skipSemicolon() {
    if (this._checkCurrentTokenType("Semicolon" /* Semicolon */)) {
      this._goNext("Semicolon" /* Semicolon */);
    }
  }
  _goNext(type) {
    const currentToken = this._tokens[this._currentIndex];
    if (Array.isArray(type)) {
      if (!type.includes(currentToken.type)) {
        throw new Error(
          `Expect ${type.join(",")}, but got ${currentToken.type}`
        );
      }
    } else {
      if (currentToken.type !== type) {
        throw new Error(`Expect ${type}, but got ${currentToken.type}`);
      }
    }
    this._currentIndex++;
    return currentToken;
  }
  _isEnd() {
    return this._currentIndex >= this._tokens.length;
  }
  _getCurrentToken() {
    return this._tokens[this._currentIndex];
  }
  _getPreviousToken() {
    return this._tokens[this._currentIndex - 1];
  }
  _getNextToken() {
    if (this._currentIndex + 1 < this._tokens.length) {
      return this._tokens[this._currentIndex + 1];
    } else {
      return false;
    }
  }
};

// ../../ast/rollupAST/src/index.ts
function parse(code) {
  const tokenizer = new Tokenizer(code);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

// src/utils/buildScope.ts
function buildScope(statement) {
  const { node, scope: initialScope } = statement;
  let scope = initialScope;
  walk(node, {
    enter(node2) {
      if (node2.type === "FunctionDeclaration" /* FunctionDeclaration */) {
        scope.addDeclaration(node2, false);
      }
      if (node2.type === "VariableDeclaration" /* VariableDeclaration */) {
        const currentNode = node2;
        const isBlockDeclaration = currentNode.kind !== "var";
        currentNode.declarations.forEach((declarator) => {
          scope.addDeclaration(declarator, isBlockDeclaration);
        });
      }
      let newScope;
      if (node2.type === "FunctionDeclaration" /* FunctionDeclaration */) {
        const currentNode = node2;
        newScope = new Scope({
          parent: scope,
          block: false,
          paramNodes: currentNode.params,
          statement
        });
      }
      if (node2.type === "BlockStatement" /* BlockStatement */) {
        newScope = new Scope({
          parent: scope,
          block: true,
          statement
        });
      }
      if (newScope) {
        Object.defineProperty(node2, "_scope", {
          value: newScope,
          configurable: true
        });
        scope = newScope;
      }
    },
    leave(node2) {
      if (node2._scope && scope.parent) {
        scope = scope.parent;
      }
    }
  });
}

// src/ast/reference.ts
var Reference = class {
  constructor(node, scope, statement) {
    // declaration 信息在构建依赖图的部分补充
    this.declaration = null;
    this.objectPaths = [];
    this.node = node;
    this.scope = scope;
    this.statement = statement;
    this.start = node.start;
    this.end = node.end;
    let root = node;
    this.objectPaths = [];
    while (root.type === "MemberExpression") {
      this.objectPaths.unshift(root.property);
      root = root.object;
    }
    this.objectPaths.unshift(root);
    this.name = root.name;
  }
};

// src/utils/findReference.ts
function isReference(node, parent) {
  if (node.type === "MemberExpression" && parent.type !== "MemberExpression") {
    return true;
  }
  if (node.type === "Identifier") {
    if (parent.type === "ExportSpecifier" && node !== parent.local)
      return false;
    return true;
  }
  return false;
}
function findReference(statement) {
  const { references, scope: initialScope, node } = statement;
  let scope = initialScope;
  walk(node, {
    enter(node2, parent) {
      if (node2._scope)
        scope = node2._scope;
      if (isReference(node2, parent)) {
        const reference = new Reference(node2, scope, statement);
        references.push(reference);
      }
    },
    leave(node2) {
      if (node2._scope && scope.parent) {
        scope = scope.parent;
      }
    }
  });
}

// src/utils/isFunctionDeclaration.ts
function isFunctionDeclaration(node) {
  if (!node)
    return false;
  return (
    // function foo() {}
    node.type === "FunctionDeclaration" || // const foo = function() {}
    node.type === "VariableDeclarator" /* VariableDeclarator */ && node.init && node.init.type === "FunctionExpression" /* FunctionExpression */ || // export function ...
    // export default function
    (node.type === "ExportNamedDeclaration" /* ExportNamedDeclaration */ || node.type === "ExportDefaultDeclaration" /* ExportDefaultDeclaration */) && !!node.declaration && node.declaration.type === "FunctionDeclaration" /* FunctionDeclaration */
  );
}
function isExportDeclaration(node) {
  return /^Export/.test(node.type);
}
function isImportDeclaration(node) {
  return node.type === "ImportDeclaration";
}

// src/statement.ts
var Statement2 = class {
  constructor(node, magicString, module2) {
    this.isIncluded = false;
    this.defines = /* @__PURE__ */ new Set();
    this.modifies = /* @__PURE__ */ new Set();
    this.dependsOn = /* @__PURE__ */ new Set();
    this.references = [];
    this.magicString = magicString;
    this.node = node;
    this.module = module2;
    this.scope = new Scope({
      statement: this
    });
    this.start = node.start;
    this.next = 0;
    this.isImportDeclaration = isImportDeclaration(node);
    this.isExportDeclaration = isExportDeclaration(node);
    this.isReexportDeclaration = this.isExportDeclaration && !!node.source;
    this.isFunctionDeclaration = isFunctionDeclaration(
      node
    );
  }
  analyse() {
    if (this.isImportDeclaration)
      return;
    buildScope(this);
    findReference(this);
  }
  mark() {
    if (this.isIncluded) {
      return;
    }
    this.isIncluded = true;
    this.references.forEach(
      (ref) => ref.declaration && ref.declaration.use()
    );
  }
};

// src/module.ts
var Module = class {
  constructor({ path, bundle, code, loader, isEntry = false }) {
    this.isEntry = false;
    this.exportAllSources = [];
    this.exportAllModules = [];
    this.dependencies = [];
    this.dependencyModules = [];
    this.referencedModules = [];
    this.id = path;
    this.bundle = bundle;
    this.moduleLoader = loader;
    this.isEntry = isEntry;
    this.path = path;
    this.code = code;
    this.magicString = new import_magic_string.default(code);
    this.imports = {};
    this.exports = {};
    this.reexports = {};
    this.declarations = {};
    try {
      const ast = parse(code);
      const nodes = ast.body;
      this.statements = nodes.map((node) => {
        const magicString = this.magicString.snip(node.start, node.end);
        return new Statement2(node, magicString, this);
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
    this.analyseAST();
  }
  analyseAST() {
    this.statements.forEach((statement) => {
      statement.analyse();
      if (statement.isImportDeclaration) {
        this.addImports(statement);
      } else if (statement.isExportDeclaration) {
        this.addExports(statement);
      }
      if (!statement.scope.parent) {
        statement.scope.eachDeclaration((name, declaration) => {
          this.declarations[name] = declaration;
        });
      }
    });
    const statements = this.statements;
    let next = this.code.length;
    for (let i = statements.length - 1; i >= 0; i--) {
      statements[i].next = next;
      next = statements[i].start;
    }
  }
  addDependencies(source) {
    if (!this.dependencies.includes(source)) {
      this.dependencies.push(source);
    }
  }
  addImports(statement) {
    const node = statement.node;
    const source = node.source.value;
    node.specifiers.forEach((specifier) => {
      const isDefault = specifier.type === "ImportDefaultSpecifier";
      const isNamespace = specifier.type === "ImportNamespaceSpecifier";
      const localName = specifier.local.name;
      const name = isDefault ? "default" : isNamespace ? "*" : specifier.imported.name;
      this.imports[localName] = { source, name, localName };
    });
    this.addDependencies(source);
  }
  addExports(statement) {
    const node = statement.node;
    const source = node.source && node.source.value;
    if (node.type === "ExportNamedDeclaration") {
      if (node.specifiers.length) {
        node.specifiers.forEach((specifier) => {
          const localName = specifier.local.name;
          const exportedName = specifier.exported.name;
          this.exports[exportedName] = {
            localName,
            name: exportedName
          };
          if (source) {
            this.reexports[localName] = {
              statement,
              source,
              localName,
              name: localName,
              module: void 0
            };
            this.imports[localName] = {
              source,
              localName,
              name: localName
            };
            this.addDependencies(source);
          }
        });
      } else {
        const declaration = node.declaration;
        let name;
        if (declaration.type === "VariableDeclaration") {
          name = declaration.declarations[0].id.name;
        } else {
          name = declaration.id.name;
        }
        this.exports[name] = {
          statement,
          localName: name,
          name
        };
      }
    } else if (node.type === "ExportDefaultDeclaration") {
      const identifier = (
        // export default foo;
        node.declaration.id && node.declaration.id.name || // export defualt function foo(){}
        node.declaration.name
      );
      this.exports["default"] = {
        statement,
        localName: identifier,
        name: "default"
      };
      this.declarations["default"] = new SyntheticDefaultDeclaration(
        node,
        identifier,
        statement
      );
    } else if (node.type === "ExportAllDeclaration") {
      if (source) {
        this.exportAllSources.push(source);
        this.addDependencies(source);
      }
    }
  }
  bind() {
    this.bindImportSpecifiers();
    this.bindReferences();
  }
  bindImportSpecifiers() {
    [...Object.values(this.imports), ...Object.values(this.reexports)].forEach(
      (specifier) => {
        specifier.module = this._getModuleBySource(specifier.source);
      }
    );
    this.exportAllModules = this.exportAllSources.map(
      this._getModuleBySource.bind(this)
    );
    this.dependencyModules = this.dependencies.map(
      this._getModuleBySource.bind(this)
    );
    this.dependencyModules.forEach((module2) => {
      module2.referencedModules.push(this);
    });
  }
  bindReferences() {
    if (this.declarations["default"] && this.exports["default"].localName) {
      const declaration = this.trace(this.exports["default"].localName);
      if (declaration) {
        this.declarations["default"].bind(
          declaration
        );
      }
    }
    this.statements.forEach((statement) => {
      statement.references.forEach((reference) => {
        const declaration = reference.scope.findDeclaration(reference.name) || this.trace(reference.name);
        if (declaration) {
          declaration.addReference(reference);
        }
      });
    });
  }
  getOrCreateNamespace() {
    if (!this.declarations["*"]) {
      this.declarations["*"] = new SyntheticNamespaceDeclaration(this);
    }
    return this.declarations["*"];
  }
  trace(name) {
    if (this.declarations[name]) {
      return this.declarations[name];
    }
    if (this.imports[name]) {
      const importSpecifier = this.imports[name];
      const importModule = importSpecifier.module;
      if (importSpecifier.name === "*") {
        return importModule.getOrCreateNamespace();
      }
      const declaration = importModule.traceExport(importSpecifier.name);
      if (declaration) {
        return declaration;
      }
    }
    return null;
  }
  traceExport(name) {
    const reexportDeclaration = this.reexports[name];
    if (reexportDeclaration) {
      const declaration = reexportDeclaration.module.traceExport(
        reexportDeclaration.localName
      );
      if (!declaration) {
        throw new Error(
          `${reexportDeclaration.localName} is not exported by module ${reexportDeclaration.module.path}(imported by ${this.path})`
        );
      }
      return declaration;
    }
    const exportDeclaration = this.exports[name];
    if (exportDeclaration) {
      const declaration = this.trace(name);
      if (declaration) {
        return declaration;
      }
    }
    for (let exportAllModule of this.exportAllModules) {
      const declaration = exportAllModule.trace(name);
      if (declaration) {
        return declaration;
      }
    }
    return null;
  }
  render() {
    const source = this.magicString.clone().trim();
    this.statements.forEach((statement) => {
      if (!statement.isIncluded) {
        source.remove(statement.start, statement.next);
        return;
      }
      statement.references.forEach((reference) => {
        const { start, end } = reference;
        const declaration = reference.declaration;
        if (declaration) {
          const name = declaration.render();
          source.overwrite(start, end, name);
        }
      });
      if (statement.isExportDeclaration && !this.isEntry) {
        if (statement.node.type === "ExportNamedDeclaration" && statement.node.specifiers.length) {
          source.remove(statement.start, statement.next);
        } else if (statement.node.type === "ExportNamedDeclaration" && (statement.node.declaration.type === "VariableDeclaration" || statement.node.declaration.type === "FunctionDeclaration")) {
          source.remove(
            statement.node.start,
            statement.node.declaration.start
          );
        } else if (statement.node.type === "ExportAllDeclaration") {
          source.remove(statement.start, statement.next);
        } else if (statement.node.type === "ExportDefaultDeclaration") {
          const defaultDeclaration = this.declarations["default"];
          const defaultName = defaultDeclaration.render();
          if (statement.node.declaration.type === "FunctionDeclaration") {
            if (statement.node.declaration.id) {
              source.overwrite(
                statement.node.start,
                statement.node.declaration.start,
                `const ${defaultName} = `
              );
            } else {
              source.overwrite(
                statement.node.start,
                statement.node.declaration.start + 8,
                `function ${defaultName}`
              );
            }
          } else {
            source.overwrite(
              statement.node.start,
              statement.node.declaration.start,
              `const ${defaultName} = `
            );
          }
        }
      }
    });
    if (this.declarations["*"]) {
      const namespaceDeclaration = this.declarations["*"];
      if (namespaceDeclaration.needsNamespaceBlock) {
        source.append(`

${namespaceDeclaration.renderBlock()}
`);
      }
    }
    return source.trim();
  }
  getExports() {
    return [
      ...keys(this.exports),
      ...keys(this.reexports),
      ...this.exportAllModules.map(
        (module2) => module2.getExports().filter((name) => name !== "default")
      ).flat()
    ];
  }
  _getModuleBySource(source) {
    const id = this.moduleLoader.resolveId(source, this.path);
    return this.bundle.getModuleById(id);
  }
};

// src/moduleLoader.ts
var import_promises = require("fs/promises");

// src/utils/resolve.ts
var import_path = require("path");
function defaultResolver(id, importer) {
  if ((0, import_path.isAbsolute)(id))
    return id;
  if (!id.startsWith("."))
    return false;
  const resolvedPath = importer ? (0, import_path.resolve)((0, import_path.dirname)(importer), id) : (0, import_path.resolve)(id);
  return resolvedPath;
}

// src/moduleLoader.ts
var ModuleLoader = class {
  constructor(bundle) {
    this.resolveIdsMap = /* @__PURE__ */ new Map();
    this.bundle = bundle;
  }
  resolveId(id, importer) {
    const cacheKey = id + importer;
    if (this.resolveIdsMap.has(cacheKey)) {
      return this.resolveIdsMap.get(cacheKey);
    }
    const resolved = defaultResolver(id, importer);
    this.resolveIdsMap.set(cacheKey, resolved);
    return resolved;
  }
  // 加载模块并解析
  fetchModule(_0, _1) {
    return __async(this, arguments, function* (id, importer, isEntry = false, bundle = this.bundle, loader = this) {
      const path = this.resolveId(id, importer);
      if (path === false) {
        return null;
      }
      const existModule = this.bundle.getModuleById(path);
      if (existModule) {
        return existModule;
      }
      const code = yield (0, import_promises.readFile)(path, { encoding: "utf-8" });
      const module2 = new Module({
        path,
        code,
        bundle,
        loader,
        isEntry
      });
      this.bundle.addModule(module2);
      yield this.fetchAllDependencies(module2);
      return module2;
    });
  }
  fetchAllDependencies(module2) {
    return __async(this, null, function* () {
      yield Promise.all(
        module2.dependencies.map((dep) => {
          return this.fetchModule(dep, module2.path);
        })
      );
    });
  }
};

// src/graph.ts
var Graph = class {
  constructor(options) {
    this.modules = [];
    this.orderedModules = [];
    this.moduleById = {};
    const { entry, bundle } = options;
    this.entryPath = (0, import_path2.resolve)(entry);
    this.basedir = (0, import_path2.dirname)(this.entryPath);
    this.bundle = bundle;
    this.moduleLoader = new ModuleLoader(bundle);
  }
  build() {
    return __async(this, null, function* () {
      const entryModule = yield this.moduleLoader.fetchModule(
        this.entryPath,
        null,
        true
      );
      this.modules.forEach((module2) => module2.bind());
      this.orderedModules = this.sortModules(entryModule);
      entryModule.getExports().forEach((name) => {
        const declaration = entryModule.traceExport(name);
        declaration.use();
      });
      this.doconflict();
    });
  }
  doconflict() {
    const used = {};
    function getSafeName(name) {
      let safeName = name;
      let count = 1;
      while (used[safeName]) {
        safeName = `${name}$${count++}`;
      }
      used[safeName] = true;
      return safeName;
    }
    this.modules.forEach((module2) => {
      keys(module2.declarations).forEach((name) => {
        const declaration = module2.declarations[name];
        declaration.name = getSafeName(declaration.name);
      });
    });
  }
  getModuleById(id) {
    return this.moduleById[id];
  }
  addModule(module2) {
    if (!this.moduleById[module2.id]) {
      this.moduleById[module2.id] = module2;
      this.modules.push(module2);
    }
  }
  sortModules(entryModule) {
    const orderedModules = [];
    const analysedModule = {};
    const parent = {};
    const cyclePathList = [];
    function getCyclePath(id, parentId) {
      const paths = [id];
      let currentId = parentId;
      while (currentId !== id) {
        paths.push(currentId);
        currentId = parent[currentId];
      }
      paths.push(paths[0]);
      return paths.reverse();
    }
    function analyseModule(module2) {
      if (analysedModule[module2.id]) {
        return;
      }
      for (const dependency of module2.dependencyModules) {
        if (parent[dependency.id]) {
          if (!analysedModule[dependency.id]) {
            cyclePathList.push(getCyclePath(dependency.id, module2.id));
          }
          continue;
        }
        parent[dependency.id] = module2.id;
        analyseModule(dependency);
      }
      analysedModule[module2.id] = true;
      orderedModules.push(module2);
    }
    analyseModule(entryModule);
    if (cyclePathList.length) {
      cyclePathList.forEach((paths) => {
        console.log(paths);
      });
      process.exit(1);
    }
    return orderedModules;
  }
};

// src/bundle.ts
var MagicString2 = __toESM(require("magic-string"));
var Bundle2 = class {
  constructor(options) {
    this.graph = new Graph({
      entry: options.entry,
      bundle: this
    });
  }
  build() {
    return __async(this, null, function* () {
      yield this.graph.build();
    });
  }
  getModuleById(id) {
    return this.graph.getModuleById(id);
  }
  addModule(module2) {
    return this.graph.addModule(module2);
  }
  render() {
    let msBundle = new MagicString2.Bundle({ separator: "\n" });
    this.graph.orderedModules.forEach((module2) => {
      msBundle.addSource({
        content: module2.render()
      });
    });
    const map = msBundle.generateMap({ includeContent: true });
    return {
      code: msBundle.toString(),
      map
    };
  }
};

// src/rollup.ts
var import_node_path = require("path");
var existsSync = (dirname4) => {
  return import_node_fs.default.existsSync(dirname4);
};
var createDir = (path) => {
  return new Promise((resolve3, reject) => {
    const lastPath = path.substring(0, path.lastIndexOf("/"));
    import_node_fs.default.mkdir(lastPath, { recursive: true }, (error) => {
      if (error) {
        reject({ success: false });
      } else {
        resolve3({ success: true });
      }
    });
  });
};
var writeFile = (path, content, format = "utf-8") => {
  return new Promise((resolve3, reject) => {
    import_node_fs.default.writeFile(
      path,
      content,
      {
        mode: 438,
        // 可读可写666，转化为十进制就是438
        flag: "w+",
        // r+并不会清空再写入，w+会清空再写入
        encoding: format
      },
      (err) => {
        if (err) {
          reject({ success: false, data: err });
        } else {
          resolve3({ success: true, data: { path, content } });
        }
      }
    );
  });
};
function rollup(options) {
  const { input = "./index.js", output = "./dist/index.js" } = options;
  const bundle = new Bundle2({
    entry: input
  });
  return bundle.build().then(() => {
    const generate = () => bundle.render();
    return {
      generate,
      write: () => __async(this, null, function* () {
        const { code, map } = generate();
        if (!existsSync((0, import_node_path.dirname)(output))) {
          yield createDir(output);
        }
        return Promise.all([
          writeFile(output, code),
          writeFile(output + ".map", map.toString())
        ]);
      })
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  rollup
});
