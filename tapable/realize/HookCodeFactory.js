class HookCodeFactory {
  constructor(config) {
    this.config = config;
    this.options = undefined;
    this._args = undefined;
  }

  init(options) {
    this.options = options;
    this._args = options.args.slice();
  }

  setup(instance, options) {
    instance._x = options.taps.map(i => i.fn);
  }

  args({ before, after } = {}) {
    let allArgs = this._args;
    if (before) {
      allArgs = [before].concat(allArgs);
    }
    if (after) {
      allArgs = allArgs.concat(after);
    }

    if (allArgs.length === 0) {
      return '';
    } else {
      return allArgs.join(', ');
    }
  }

  header() {
    let code = '';
    code += 'var _context;\n';
    code += 'var _x = this._x;\n';
    return code;
  }

  create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
      case 'sync':
        fn = new Function(
          this.args(),
          '"use strict";\n' +
            this.header() +
            this.contentWithInterceptors({
              onDone: () => '',
              resultReturns: true,
              rethrowIfPossible: true,
              onError: err => `throw ${err}; \n`,
              onResult: result => `return ${result}; \n`
            })
        );

        console.log("fn", fn.toString());
        break;
      default:
        break;
    }
    this.deinit();
    return fn;
  }

  deinit() {
    this._args = undefined;
    this.options = undefined;
  }

  contentWithInterceptors(options) {
    if (this.options.interceptors.length > 0) {
    } else {
      return this.content(options);
    }
  }

  /**
   * @description: callTapsSeries 遍历所有注册的 taps 编译成为对应的最终需要执行的函数
   * @param {*} onDone
   */
  callTapsSeries({ onDone }) {
    let code = '';
    let current = onDone;

    if (this.options.taps.length === 0) {
      return onDone();
    }

    for (let i = this.options.taps.length - 1; i >= 0; i--) {
      const done = current;
      const content = this.callTap(i, {
        onDone: done
      });
      current = () => content;
    }
    code += current();
    return code;
  }

  /**
   * @description: callTap 根据单个 tap 的类型生成对应的函数调用语句进行返回
   * @param {*} tapIndex
   * @param {*} onDone
   */
  callTap(tapIndex, { onDone }) {
    let code = '';
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
    const tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        code += `_fn${tapIndex}(${this.args()});\n`;
        break;
      default:
        break;
    }
    if (onDone) {
      code += onDone();
    }
    return code;
  }

  /**
   * @description: getTapFn 从this._x中获取函数内容 this._x[index]
   * @param {*} idx
   */
  getTapFn(idx) {
    return `_x[${idx}]`;
  }
}

export default HookCodeFactory;
