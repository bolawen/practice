const spaceCharsReg = /^[\t\r\n\f\s]+/;
const equalCharReg = /^[\t\r\n\f\s]*=/;
const attributeNameReg = /^[^\t\r\n\f\s/>][^\t\r\n\f\s/>=]*/;
const vueDirectiveNamePrefixReg = /^(v-[a-zA-Z0-9]|:|\.|@|#)/;
const vueDirectiveNameReg = /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i;


function advanceBy(context, numberOfCharacters) {
  const { source } = context;
  context.source = source.slice(numberOfCharacters);
}

function advanceSpaces(context) {
  const match = spaceCharsReg.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
}

function parseTextData(context, length) {
  const rawText = context.source.slice(0, length);
  advanceBy(context, length);
  return rawText;
}

function parseAttributeValue(context) {
  let content;
  const quote = context.source[0];
  const isQuoted = quote === `"` || quote === `'`;
  if (isQuoted) {
    advanceBy(context, 1);
    const endIndex = context.source.indexOf(quote);
    if (endIndex === -1) {
      content = parseTextData(context, context.source.length);
    } else {
      content = parseTextData(context, endIndex);
      advanceBy(context, 1);
    }
  }

  return {
    content
  };
}

function parseAttribute(context) {
  advanceSpaces(context);
  const match = attributeNameReg.exec(context.source);
  const name = match[0];
  advanceBy(context, name.length);

  let value;

  if (equalCharReg.test(context.source)) {
    advanceSpaces(context);
    advanceBy(context, 1);
    value = parseAttributeValue(context);
  }

  if(vueDirectiveNamePrefixReg.test(name)){
    
  }

  return {
    name,
    type: 'attribute',
    value: value && {
      type: 'text',
      content: value.content
    }
  };
}

function parseAttributes(str) {
  const context = {
    source: str
  };

  const props = [];

  while (context.source) {
    const attr = parseAttribute(context);
    props.push(attr);
    advanceSpaces(context);
  }

  return props;
}

let str = `id='div-id' class='div-class' v-if='isShow' v-for='item in list'`;
console.log(parseAttributes(str));
