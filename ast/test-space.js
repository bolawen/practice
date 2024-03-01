const spacesReg = /^[\t\r\n\f\s]+/;

const spaceReg = /^[\t\r\n\f\s]+/;

function advance(text, numberOfCharacters) {
  return text.slice(numberOfCharacters);
}

function advanceSpaces(text) {
  const match = spacesReg.exec(text);
  if (match) {
    return advance(text, match[0].length);
  }
  return text;
}

const str1 = 'abcdef';
const str2 = '  abcdef';
const str3 = `
abcdef
`;

console.log(advanceSpaces(str1));
console.log(advanceSpaces(str2));
console.log(advanceSpaces(str3));
