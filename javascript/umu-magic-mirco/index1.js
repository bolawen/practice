const _cacheModule = {};
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

function mitt(all) {
  all = all || new Map();

  return {
    all,

    on(type, handler) {
      const handlers = all.get(type);
      const added = handlers && handlers.push(handler);
      if (!added) {
        all.set(type, [handler]);
      }
    },

    off(type, handler) {
      const handlers = all.get(type);
      if (handlers) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      }
    },

    emit(type, ...args) {
      (all.get(type) || []).slice().map(handler => {
        handler(...args);
      });
    }
  };
}

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
  var jsPath = paths[paths.length - 1];
  var langPaths = [];
  paths.forEach((path, index) => {
    if (index < path.length - 1) {
      langPaths.push(path);
    }
  });

  return Promise.all(
    langPaths.map(path => {
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
  ).then(() => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.className = name;
      script.src = jsPath;
      script.onload = () => resolve(jsPath);
      script.onerror = () => reject(new Error(jsPath));
      container.appendChild(script);
    });
  });
}

function formatAliasTagTypes(name, options) {
  const styles = options['styles'] || [];
  const scripts = options['scripts'] || [];

  styles.forEach(style => {
    formatScripts8StylesTagAlias(tagMetaData['styles'], style, name);
  });

  loadScriptAsync(scripts, name);
}

class EventEmitterWrapper {
  constructor() {
    this.$$emitter = mitt(this.$$eventsMap);
  }

  on(event, handler) {
    this.$$emitter.on(event, handler);
  }

  off(event, handler) {
    this.$$emitter.off(event, handler);
  }

  emit(event, ...args) {
    this.$$emitter.emit(event, ...args);
    return this.eventListenersCount(event) > 0;
  }

  once(event, handler) {
    const onceHandler = eventData => {
      handler(eventData);
      this.off(event, onceHandler);
    };

    return this.on(event, onceHandler);
  }

  listenerCount(event) {
    return this.eventListenersCount(event);
  }

  eventListenersCount(event) {
    return this.$$eventsMap.has(event) ? this.$$eventsMap.get(event).length : 0;
  }
}

class MicroChannel extends EventEmitterWrapper {
  static getInstance() {
    if (!manager) {
      manager = new MicroChannel();
    }
    return manager;
  }
  constructor() {
    super();
  }

  sendMessage(params) {
    this.emit(params.type, params.msg);
  }
  onMessage(eventType, handle) {
    this.on(eventType, handle);
  }
}

class UMUMagicMirco {
  static registerPage(pageInfo) {
    if (!pageInfo.name) {
      return console.log('name 必须填');
    }
    const pageName = pageInfo.name;
    if (_cacheModule[pageName]) {
      _cacheModule[pageName] = Object.assign(
        {},
        _cacheModule[pageName],
        pageInfo
      );
      return;
    }
    _cacheModule[pageName] = Object.assign({}, pageInfo);
  }
  static pageLoader(name, options) {
    return new Promise(resolve => {
      formatAliasTagTypes(name, options);
      resolve({});
    });
  }
  static getPageInfo(name) {
    return _cacheModule[name];
  }
  static sendMessage(params) {
    MicroChannel.sendMessage(params);
  }
  static onMessage(eventType, handle) {
    MicroChannel.onMessage(eventType, handle);
  }
  static off(eventType, handle) {
    MicroChannel.off(eventType, handle);
  }
}
