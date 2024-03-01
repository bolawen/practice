const equalCharReg = /^[\t\r\n\f\s]*=/;

function isEqualChar(content) {
  return equalCharReg.test(content);
}

console.log(isEqualChar(' = '));
