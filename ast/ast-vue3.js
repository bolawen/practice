const tagType = {
  start: 1,
  end: 2
};

const nodeTypes = {
  text: 2,
  element: 1,
  attribute: 3
};

function isEnd(context) {
  const { source } = context;
  if (startsWith(source, '</')) {
    return true;
  }
  return !source;
}

function startsWith(source, searchString) {
  return source.startsWith(searchString);
}

function pushNode(nodes, node) {
  nodes.push(node);
}

function advanceBy(context, numberOfCharacters) {
  const { source } = context;
  context.source = source.slice(numberOfCharacters);
}

function advanceSpaces(context) {
  const match = /^[\t\r\f\s\n]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
}

function parseAttributeValue(context) {
  let content = '';

  const quote = context.source[0];
  const isQuote = quote === `"` || quote === `'`;

  if (isQuote) {
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
    content,
    isQuote
  };
}

function parseAttribute(context, nameSet) {
  const match = /^[^\t\r\n\f\s/>][^\t\r\n\f\s/>=]*/.exec(context.source);
  const name = match[0];
  nameSet.add(name);
  advanceBy(context, name.length);

  let value;
  if (/^[\s\r\n\t\f]*=/.test(context.source)) {
    advanceSpaces(context);
    advanceBy(context, 1);
    advanceSpaces(context);

    value = parseAttributeValue(context);
  }

  return {
    type: nodeTypes.attribute,
    name,
    value: value && {
      type: nodeTypes.text,
      content: value.content
    }
  };
}

function parseAttributes(context, type) {
  const props = [];
  const attributeNames = new Set();

  while (
    context.source.length > 0 &&
    !startsWith(context.source, '>') &&
    !startsWith(context.source, '/>')
  ) {
    const attr = parseAttribute(context, attributeNames);
    if (type === tagType.start) {
      props.push(attr);
    }
    advanceSpaces(context);
  }
  return props;
}

function parseElement(context) {
  const element = parseTag(context, tagType.start);
  return element;
}

function parseTag(context, type) {
  const match = /^<\/?([a-z][^\t\r\f\n\s/>]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);

  advanceSpaces(context);
  const props = parseAttributes(context, type);

  const isSelfClosing = startsWith(context.source, '/>');
  advanceBy(context, isSelfClosing ? 2 : 1);

  return {
    tag,
    props,
    children: [],
    type: nodeTypes.element
  };
}

function parseText(context) {
  const endTokens = ['<'];
  let endIndex = context.source.length;
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1);
    if (index != -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    content,
    type: nodeTypes.text
  };
}

function parseTextData(context, length) {
  const rawText = context.source.slice(0, length);
  advanceBy(context, length);
  return rawText;
}

function createParseContext(content) {
  return {
    source: content
  };
}

function baseParse(context) {
  const nodes = [];
  while (!isEnd(context)) {
    let node;
    const { source } = context;
    if (source[0] === '<') {
      if (/[a-z]/i.test(source[1])) {
        node = parseElement(context);
      }
    }

    if (!node) {
      node = parseText(context);
    }
    pushNode(nodes, node);
  }
  return nodes;
}

function parse(content) {
  const context = createParseContext(content);
  return baseParse(context);
}

const template = `<div id="div-id" class='div-class'> Hello World</div>`;
const ast = parse(template);
console.log(ast);
