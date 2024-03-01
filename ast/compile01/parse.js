import { NodeTypes } from './ast.js';

const tagReg = /[a-z]/i;
const startTagReg = /^<\/?([a-z][^\t\r\n\f\s/>]*)/i;
const endTagEndCharReg = /[\t\r\n\f\s/>]/;
const spaceCharsReg = /^[\t\r\n\f\s+]/;
const attributeNameReg = /^[^\t\r\n\f\s/>][^\t\r\n\f\s/>=]*/;
const equalCharReg = /^[\t\r\n\f\s]*=/;
const vueDirectiveNamePrefixReg = /^(v-[a-zA-Z0-9]|:|\.|@|#)/;
const vueDirectiveNameReg =
  /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i;

const TagType = {
  start: 1,
  end: 2
};

const TextModes = {
  DATA: 1, // End tags of ancestors
  RCDATA: 2, // End tag of the parent, 比如 <textarea>
  RAWTEXT: 3, // End tag of the parent, 比如 <style>,<script>
  CDATA: 4,
  ATTRIBUTE_VALUE: 5
};

const ElementTypes = {
  ELEMENT: 1,
  COMPONENT: 2,
  SLOT: 3,
  TEMPLATE: 4
};

const defaultParseOptions = {
  delimiters: ['{{', '}}'],
  getTextMode: () => TextModes.DATA
};

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

function createRoot(children) {
  return {
    children,
    components: [],
    directives: [],
    type: NodeTypes.Root,
    codegenNode: undefined
  };
}

function createParseContext(content, rawOptions) {
  const options = Object.assign({}, defaultParseOptions);
  if (rawOptions) {
    for (key in rawOptions) {
      options[key] =
        rawOptions[key] == undefined
          ? defaultParseOptions[key]
          : rawOptions[key];
    }
  }
  return {
    options,
    source: content
  };
}

function startsWith(source, searchString) {
  return source.startsWith(searchString);
}

function startsWithEndTagOpen(source, tag) {
  return (
    startsWith(source, '</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase() &&
    endTagEndCharReg.test(source[2 + tag.length] || '>')
  );
}

function isEnd(context, mode, ancestors) {
  const s = context.source;
  switch (mode) {
    case TextModes.DATA:
      if (startsWith(s, '</')) {
        for (let i = ancestors.length - 1; i >= 0; --i) {
          if (startsWithEndTagOpen(s, ancestors[i].tag)) {
            return true;
          }
        }
      }
      break;
  }
  return !s;
}

function parseTextData(context, length, mode) {
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
      content = parseTextData(
        context,
        context.source.length,
        TextModes.ATTRIBUTE_VALUE
      );
    } else {
      content = parseTextData(context, endIndex, TextModes.ATTRIBUTE_VALUE);
      advanceBy(context, 1);
    }
  } else {
  }

  return {
    content
  };
}

function parseAttribute(context) {
  const match = attributeNameReg.exec(context.source);
  const name = match[0];
  advanceBy(context, name.length);

  let value;

  if (equalCharReg.test(context.source)) {
    advanceSpaces(context);
    advanceBy(context, 1);
    advanceSpaces(context);
    value = parseAttributeValue(context);
  }

  if (vueDirectiveNamePrefixReg.test(name)) {
    const match = vueDirectiveNameReg.exec(name);

    let dirName =
      match[1] ||
      (startsWith(name, ':') ? 'bind' : startsWith(name, '@') ? 'on' : 'slot');

    let arg;
    if (match[2]) {
      let content = match[2];
      arg = {
        content,
        type: NodeTypes.Simple_Expression
      };
    }

    const modifiers = match[3] ? match[3].slice(1).split('.') : [];

    return {
      arg,
      modifiers,
      name: dirName,
      type: NodeTypes.Directive,
      exp: value && {
        content: value.content,
        type: NodeTypes.Simple_Expression
      }
    };
  }

  return {
    name,
    value: {
      type: NodeTypes.Text,
      content: value.content
    },
    type: NodeTypes.Attribute
  };
}

function parseAttributes(context, type) {
  const props = [];
  while (
    context.source.length > 0 &&
    !startsWith(context.source, '>') &&
    !startsWith(context.source, '/>')
  ) {
    if (startsWith(context.source, '/')) {
      advanceBy(context, 1);
      advanceSpaces(context);
      continue;
    }
    const attr = parseAttribute(context);

    if (
      attr.type === NodeTypes.Attribute &&
      attr.value &&
      attr.name === 'class'
    ) {
      attr.value.content = attr.value.content.replace(/\s+/g, ' ').trim();
    }

    if (type === TagType.start) {
      props.push(attr);
    }

    advanceSpaces(context);
  }
  return props;
}

function parseTag(context, type) {
  const match = startTagReg.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceSpaces(context);

  let props = parseAttributes(context, type);
  let isSelfClosing = false;
  if (context.source.length === 0) {
  } else {
    isSelfClosing = startsWith(context.source, '/>');
    advanceBy(context, isSelfClosing ? 2 : 1);
  }

  if (type === TagType.end) {
    return;
  }

  let tagType = ElementTypes.ELEMENT;

  return {
    tag,
    props,
    tagType,
    children: [],
    isSelfClosing,
    codegenNode: undefined,
    type: NodeTypes.Element
  };
}

function parseText(context, mode) {
  const endTokens = ['<', context.options.delimiters[0]];
  let endIndex = context.source.length;
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex, mode);
  return {
    content,
    type: NodeTypes.Text
  };
}

function parseElement(context, ancestors) {
  const element = parseTag(context, TagType.start);

  if (element.isSelfClosing) {
    return element;
  }

  ancestors.push(element);
  const mode = context.options.getTextMode();
  const children = parseChildren(context, mode, ancestors);
  ancestors.pop();
  element.children = children;

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.end);
  }

  return element;
}

function parseChildren(context, mode, ancestors) {
  const nodes = [];

  while (!isEnd(context, mode, ancestors)) {
    const s = context.source;
    let node = undefined;
    if (s[0] === '<') {
      if (s.length === 1) {
      } else if (s[1] === '!') {
        if (startsWith(s, '<!--')) {
        } else if (startsWith(s, '<!DOCTYPE')) {
        } else if (startsWith(s, '<![CDATA[')) {
        } else {
        }
      } else if (s[1] === '/') {
        if (s.length === 2) {
        } else if (s[2] === '>') {
        } else if (tagReg.test(s[2])) {
        } else {
        }
      } else if (tagReg.test(s[1])) {
        node = parseElement(context, ancestors);
      } else if (s[1] === '?') {
      } else {
      }
    }

    if (!node) {
      node = parseText(context, mode);
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        nodes.push(node[i]);
      }
    } else {
      nodes.push(node);
    }
  }

  return nodes;
}

export function parse(content) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context, TextModes.DATA, []));
}
