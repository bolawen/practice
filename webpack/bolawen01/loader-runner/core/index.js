const Fs = require('fs');

function createLoaderObject(loader) {
  const obj = {
    normal: null,
    pitch: null,
    raw: null,
    data: null, // 保存传递的data; pitch 阶段通过给 this.data 赋值;  normal 阶段通过 this.data 取值;
    request: loader, // 保存当前 loader 资源绝对路径
    pitchExecuted: false, // 标记 loader  的 pitch 函数已经执行过
    normalExecuted: false // 标记 loader 的 normal 函数已经执行过
  };

  const normalLoader = require(obj.request);
  obj.normal = normalLoader;
  obj.pitch = normalLoader.pitch;
  obj.raw = normalLoader.raw;
  return obj;
}

/**
 * @description: convertArgs 转化资源 source 的格式
 */
function convertArgs(args, raw) {
  if (!raw && Buffer.isBuffer(args[0])) {
    args[0] = args[0].toString();
  } else if (raw && typeof args[0] === 'string') {
    args[0] = Buffer.from(args[0], 'utf8');
  }
}

/**
 * @description: 同步/异步 执行 pitch/normal 函数
 * fn: 需要被执行的 pitch 或者 normal 函数
 * context: loaderContext
 * args: pitch/normal 函数的参数
 *       pitch 函数: [remainingRequest, previousRequest, data]
 *       normal 函数: [resourceBuffer]
 * callback: 回调函数, 执行完 pitch/normal 的 runSyncOrAsync 之后的回调函数
 */
function runSyncOrAsync(fn, context, args, callback) {
  // 是否同步
  let isSync = true;
  // 是否执行完毕
  let isDone = false;

  // 定义 loaderContext.callback: 通过闭包结合 isSync 变量实现了 this.callback API
  const innerCallback = (context.callback = function () {
    isDone = true;
    // 当调用 this.callback 时, 标记不走 loader 函数的 return 逻辑
    isSync = false;
    callback(null, ...arguments);
  });

  // 定义 loaderContext.async: 通过闭包结合 isSync 变量实现了 this.callback API
  context.async = function () {
    isSync = false;
    return innerCallback;
  };

  // 执行 pitch/normal 函数
  const result = fn.apply(context, args);

  if (isSync) {
    isDone = true;
    if (result === undefined) {
      return callback();
    }

    if (
      result &&
      typeof result === 'object' &&
      typeof result.then === 'function'
    ) {
      return result.then(r => callback(null, r), callback);
    }

    return callback(null, result);
  }
}

/**
 * @description: 迭代 normal-loader
 */
function iterateNormalLoaders(options, loaderContext, args, callback) {
  // 越界元素判断 越界表示所有 normal 函数执行完毕 直接调用 callback 返回
  if (loaderContext.loaderIndex < 0) {
    return callback(null, args);
  }

  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  const normalFunction = currentLoader.normal;
  currentLoader.normalExecuted = true;

  if (!normalFunction) {
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  convertArgs(args, currentLoader.raw);
  
  runSyncOrAsync(normalFunction, loaderContext, args, (err, ...args) => {
    if (err) {
      return callback(err);
    }
    iterateNormalLoaders(options, loaderContext, args, callback);
  });
}

/**
 * @description: 读取文件
 */
function processResource(options, loaderContext, callback) {
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;
  const resource = loaderContext.resourcePath;
  loaderContext.readResource(resource, (err, buffer) => {
    if (err) {
      return callback(err);
    }
    options.resourceBuffer = buffer;
    iterateNormalLoaders(options, loaderContext, [buffer], callback);
  });
}

/**
 * @description: 迭代 pitch-loader
 * @param {*} options
 * @param {*} loaderContext
 * @param {*} callback
 * 核心逻辑: 执行第一个 loader 的 pitch 依次迭代, 如果到了最后一个结束 就开始读取文件
 */
function iteratePitchingLoaders(options, loaderContext, callback) {
  // 超出 loader 个数 表示所有 pitch 已经结束 那么此时需要开始读取资源文件内容
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(options, loaderContext, callback);
  }
  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  // 当前 loader 的 pitch 已经执行过了 继续递归执行下一个
  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  const pitchFunction = currentLoaderObject.pitch;
  // 标记当前loader pitch已经执行过
  currentLoaderObject.pitchExecuted = true;

  // 如果当前 loader 不存在 pitch 阶段
  if (!pitchFunction) {
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  runSyncOrAsync(
    pitchFunction,
    loaderContext,
    [
      currentLoaderObject.remainingRequest,
      currentLoaderObject.previousRequest,
      currentLoaderObject.data
    ],
    (error, ...args) => {
      if (error) {
        return callback(error);
      }

      const hasArg = args.some(i => i !== undefined);

      /**
       * @description: 根据 pitch 返回值, 判断是否需要熔断 or 继续往下执行下一个 pitch
       * pitch 函数存在返回值 -> 进行熔断 掉头执行 normal-loader
       * pitch 函数不存在返回值 -> 继续迭代下一个 iteratePitchLoader
       */
      if (hasArg) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(options, loaderContext, args, callback);
      } else {
        iteratePitchingLoaders(options, loaderContext, callback);
      }
    }
  );
}

function runLoaders(options, callback) {
  const resource = options.resource || '';
  let loaders = options.loaders || [];
  const loaderContext = options.context || {};
  const readResource = options.readResource || Fs.readFile.bind(Fs);
  loaders = loaders.map(createLoaderObject);

  loaderContext.resourcePath = resource;
  loaderContext.readResource = readResource;
  loaderContext.loaderIndex = 0;
  loaderContext.loaders = loaders;
  loaderContext.data = null;
  loaderContext.async = null;
  loaderContext.callback = null;

  // loaderContext.request 保存所有 loader 路径和资源路径, 全部转化为 inline-loader 的形式(字符串拼接的"!"分割的形式)
  Object.defineProperty(loaderContext, 'request', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .map(l => l.request)
        .concat(loaderContext.resourcePath || '')
        .join('!');
    }
  });

  /**
   * @description: loaderContext.remainingRequest 保存当前 loader 之后的所有 loader 路径和资源路径, 全部转化为 inline-loader 的形式(字符串拼接的"!"分割的形式)
   */
  Object.defineProperty(loaderContext, 'remainingRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map(i => i.request)
        .concat(loaderContext.resourcePath)
        .join('!');
    }
  });

  /**
   * @description: loaderContext.currentRequest 保存当前 loader 以及之后的所有 loader 路径和资源路径, 全部转化为 inline-loader 的形式(字符串拼接的"!"分割的形式)
   */
  Object.defineProperty(loaderContext, 'currentRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map(l => l.request)
        .concat(loaderContext.resourcePath)
        .join('!');
    }
  });

  /**
   * @description: loaderContext.previousRequest 保存当前 loader 之前的所有 loader 路径和资源路径, 全部转化为 inline-loader 的形式(字符串拼接的"!"分割的形式)
   */
  Object.defineProperty(loaderContext, 'previousRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map(l => l.request)
        .join('!');
    }
  });

  /**
   * @description: loaderContext.data 保存当前 loader 传递的 data
   */
  Object.defineProperty(loaderContext, 'data', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    }
  });

  // 用来存储读取资源文件的二进制内容 (转化前的原始文件内容)
  const processOptions = {
    resourceBuffer: null
  };

  /**
   * @description: Loader 执行阶段 -- Pitch 阶段, 按照 post - inline - normal - pre 顺序迭代 pitch
   */
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer
    });
  });
}

module.exports = {
  runLoaders
};
