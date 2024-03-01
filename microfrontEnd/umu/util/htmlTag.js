const voidTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];

const tagMetaData = {
  scripts: (sourceUrl, name) => {
    const script = createHtmlTagObject('script', {
      type: 'text/javascript',
      src: sourceUrl,
      class: name
    });
    document.body.appendChild(renderHtmlTagObjectToHtmlElement(script));
    return script;
  },
  styles: (sourceUrl, name) => {
    const style = createHtmlTagObject('link', {
      rel: 'stylesheet',
      type: 'text/css',
      href: sourceUrl,
      class: name
    });
    document.head.appendChild(renderHtmlTagObjectToHtmlElement(style));
    return style;
  }
};



function renderHtmlTagObjectToHtmlElement(tagDefinition) {
  const tagElement = document.createElement(tagDefinition.tagName);
  Object.keys(tagDefinition.attributes || {}).forEach(attributeName => {
    tagElement.setAttribute(
      attributeName,
      tagDefinition.attributes?.[attributeName] || ''
    );
  });
  if (!tagDefinition.voidTag && tagDefinition.innerHTML) {
    tagElement.innerHTML = tagDefinition.innerHTML;
  }
  return tagElement;
}

function formatScripts8StylesTagAlias(type, tagOption, name) {
  if (typeof tagOption === 'string') {
    return tagMetaData[type](tagOption, name);
  }
  return tagOption;
}

function createHtmlTagObject(tagName, attributes, innerHTML) {
  return {
    tagName,
    voidTag: voidTags.indexOf(tagName) !== -1,
    attributes: attributes,
    innerHTML
  };
}

function loadScriptAsync(paths, name) {
  const container = document.body || document.head || document.documentElement;

  return Promise.all(
    paths.map(path => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = name;
        script.src = path;
        script.defer = true;
        script.onload = () => resolve(path);
        script.onerror = () => reject(new Error(path));
        container.appendChild(script);
      });
    })
  )
}

export function formatAliasTagTypes(name, options) {
  const styles = options['styles'] || [];
  const scripts = options['scripts'] || [];

  styles.forEach(style => {
    formatScripts8StylesTagAlias(tagMetaData['styles'], style, name);
  });

  loadScriptAsync(scripts, name);
}

