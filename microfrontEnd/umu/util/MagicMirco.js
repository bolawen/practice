import MicroChannel from './MicroChannel.js';
import { formatAliasTagTypes } from './htmlTag.js';

let magicMicro = null;

class MagicMirco {
  static getInstance() {
    if (!magicMicro) {
      return new MagicMirco();
    }
    return magicMicro;
  }

  constructor() {
    this._cacheModule = {};
    this.microChannel = MicroChannel.getInstance();
  }

  registerPage(pageInfo) {
    if (!pageInfo.name) {
      return console.log('name 必须填');
    }

    let name = this.mergedPageName(pageInfo.name);
    if (this._cacheModule[name]) {
      this._cacheModule[name] = Object.assign(
        {},
        this._cacheModule[name],
        pageInfo
      );
      return;
    }
    this._cacheModule[name] = Object.assign({}, pageInfo);
  }

  pageLoader(name, options) {
    name = this.mergedPageName(name);
    return new Promise(resolve => {
      formatAliasTagTypes(name, options);
      resolve({});
    });
  }
  getPageInfo(name) {
    name = this.mergedPageName(name);
    return this._cacheModule[name];
  }
  sendMessage(params) {
    params.type = this.mergedMessageName(params.type);
    this.microChannel.sendMessage(params);
  }
  onMessage(eventType, handle) {
    eventType = this.mergedMessageName(eventType);
    this.microChannel.onMessage(eventType, handle);
  }
  off(eventType, handle) {
    this.microChannel.off(eventType, handle);
  }
  mergedPageName(name) {
    const prefix = 'micro-';
    const mergedName = name.includes(prefix) ? name : `micro-${name}`;
    return mergedName;
  }
  mergedMessageName(name){
    const prefix = 'connect-';
    const mergedName = name.includes(prefix) ? name : `connect-${name}`;
    return mergedName;
  }
}

magicMicro = MagicMirco.getInstance();
export default magicMicro;
