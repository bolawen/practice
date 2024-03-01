const startTagReg = /^<\/?([a-z][^\t\r\n\f\s/>]*)/i;

function parseTag(content) {
  const match = startTagReg.exec(content);
  const tag = match[1];
  return tag;
}

const str = '<div class="div-class"></div>';
console.log(parseTag(str));

const str1 = '<input class="div-class" />';
console.log(parseTag(str1));
