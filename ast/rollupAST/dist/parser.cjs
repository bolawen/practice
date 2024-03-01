var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/parser.ts
var parser_exports = {};
__export(parser_exports, {
  Parser: () => Parser
});
module.exports = __toCommonJS(parser_exports);

// src/tokenizer.ts
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

// src/parser.ts
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Parser
});
//# sourceMappingURL=parser.cjs.map