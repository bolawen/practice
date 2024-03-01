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

// src/tokenizer.ts
var tokenizer_exports = {};
__export(tokenizer_exports, {
  ScanMode: () => ScanMode,
  TokenType: () => TokenType,
  Tokenizer: () => Tokenizer
});
module.exports = __toCommonJS(tokenizer_exports);

// src/utils.ts
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

// src/tokenizer.ts
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2["Let"] = "Let";
  TokenType2["Const"] = "Const";
  TokenType2["Var"] = "Var";
  TokenType2["Assign"] = "Assign";
  TokenType2["Function"] = "Function";
  TokenType2["Number"] = "Number";
  TokenType2["Operator"] = "Operator";
  TokenType2["Identifier"] = "Identifier";
  TokenType2["LeftParen"] = "LeftParen";
  TokenType2["RightParen"] = "RightParen";
  TokenType2["LeftCurly"] = "LeftCurly";
  TokenType2["RightCurly"] = "RightCurly";
  TokenType2["Comma"] = "Comma";
  TokenType2["Dot"] = "Dot";
  TokenType2["Semicolon"] = "Semicolon";
  TokenType2["StringLiteral"] = "StringLiteral";
  TokenType2["Return"] = "Return";
  TokenType2["Import"] = "Import";
  TokenType2["Export"] = "Export";
  TokenType2["Default"] = "Default";
  TokenType2["From"] = "From";
  TokenType2["As"] = "As";
  TokenType2["Asterisk"] = "Asterisk";
  return TokenType2;
})(TokenType || {});
var ScanMode = /* @__PURE__ */ ((ScanMode2) => {
  ScanMode2[ScanMode2["Normal"] = 0] = "Normal";
  ScanMode2[ScanMode2["Identifier"] = 1] = "Identifier";
  ScanMode2[ScanMode2["StringLiteral"] = 2] = "StringLiteral";
  ScanMode2[ScanMode2["Number"] = 3] = "Number";
  return ScanMode2;
})(ScanMode || {});
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ScanMode,
  TokenType,
  Tokenizer
});
//# sourceMappingURL=tokenizer.cjs.map