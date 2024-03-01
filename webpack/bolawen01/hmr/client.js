let lastHash;
let socket = io('/');
const status = {
  currentHash: typeof __webpack_hash__ !== 'undefined' ? __webpack_hash__ : ''
};
const options = {
  hot: true
};

class Emitter {
  constructor() {
    this.listeners = {};
  }

  on(type, listener) {
    this.listeners[type] = listener;
  }

  emit(type, ...args) {
    this.listeners[type] && this.listeners[type].apply(null, args);
  }
}

function check() {
  module.hot.check(true);
}

const hotEmitter = new Emitter();

hotEmitter.on('webpackHotUpdate', function (currentHash) {
  lastHash = currentHash;
  if (module.hot.status() === 'idle') {
    check();
  }
});

function reloadApp(options, status) {
  const { hot } = options;
  const { currentHash, previousHash } = status;
  const isInitial = currentHash.indexOf(previousHash) >= 0;

  if (isInitial) {
    return;
  }

  if (hot) {
    hotEmitter.emit('webpackHotUpdate', status.currentHash);
  } else {
    window.location.reload();
  }
}

socket.on('hash', hash => {
  status.previousHash = status.currentHash;
  status.currentHash = hash || '';
});

socket.on('ok', () => {
  reloadApp(options, status);
});
