import Hook from './Hook.js';
import HookCodeFactory from './HookCodeFactory.js';

class SyncHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onDone,
      rethrowIfPossible
    });
  }
}

const factory = new SyncHookCodeFactory();

function COMPILE(options) {
  factory.setup(this, options);
  return factory.create(options);
}

const TAP_ASYNC = () => {
  throw new Error('tapAsync is not supported on a SyncHook');
};

const TAP_PROMISE = () => {
  throw new Error('tapPromise is not supported on a SyncHook');
};

class SyncHook extends Hook {
  constructor(args = [], name = undefined) {
    super(args, name);
    this.tapAsync = TAP_ASYNC;
    this.tapPromise = TAP_PROMISE;
    this.compile = COMPILE;
  }
}

export default SyncHook;
