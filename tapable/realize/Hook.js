
/**
 * @description: syncHook.call 触发事件 => this.call => this._createCall() => compile() 编译生成最终生成的执行函数
 * @param {array} args
 * 事件发布订阅思想
 * syncHook.tap: 注册事件 => 本质上 this._taps.push({ type: 'sync', name: "", fn: fn});
 * syncHoo.call: 触发已注册的事件 => 本质上通过 this._createCall() => compile() 编译生成最终生成的执行函数, 然后执行
 */
const CALL_DELEGATE = function (...args) {
  this.call = this._createCall('sync');
  return this.call(...args);
};

class Hook {
  constructor(args = [], name = undefined) {
    this._args = args;
    this.name = name;
    this.taps = [];
    this.interceptors = [];
    this._call = CALL_DELEGATE;
    this.call = CALL_DELEGATE;
    this._x = undefined;

    this.compile = this.compile;
    this.tap = this.tap;
  }

  tap(options, fn) {
    this._tap('sync', options, fn);
  }

  /**
   * @description: syncHook.tap 注册事件 => this._tap => this.taps.push({ type: 'sync', name: "", fn: fn});
   * @param {*} type
   * @param {*} options
   * @param {*} fn
   */  
  _tap(type, options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim()
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }

    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }

    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }

    options = Object.assign({ type, fn }, options);
    this._insert(options);
  }

  _insert(item) {
    // 当我们通过 hooks.tap 注册方法时每次都会触发 _insert 方法，故而我们在 _insert 方法中每次都重置 this.call 方法为编译方法 CALL_DELEGATE 。
    this._resetCompilation();
    this.taps.push(item);
  }

  compile(options) {
    throw new Error('Abstract: should be overridden');
  }

  _createCall(type){
    return this.compile({
        type: type,
        taps: this.taps,
        args: this._args,
        interceptors: this.interceptors,
    });
  }

  _resetCompilation(){
    this.call = this._call;
  }
}

export default Hook;
