const queued_state = 0;
const processing_state = 1;
const done_state = 2;

class ArrayQueue {
  constructor(items) {
    this._list = items ? Array.from(items) : [];
  }

  enqueue(item) {
    this._list.push(item);
  }

  dequeue() {
    return this._list.shift();
  }
}

class AsyncQueueEntry {
  constructor(item, callback) {
    this.item = item;
    this.state = queued_state;
    this.callback = callback;
    this.callbacks = undefined;
    this.result = undefined;
    this.error = undefined;
  }
}

class AsyncQueue {
  constructor(options) {
    this.options = options;
    this.name = options.name;
    // 处理器函数
    this.processor = options.processor;
    // 并发执行最大数
    this.parallelism = options.parallelism;
    // 唯一标示函数
    this.getKey = options.getKey;
    // 保存当前队列中等待执行的任务
    this._queued = new ArrayQueue();
    // 保存当前队列中所有已经执行过的任务
    this._entries = new Map();
    // 当前并发任务
    this._activeTask = 0;
    // 是否开启下次事件队列 EventLoop 中等待执行的函数
    this._willEnsureProcessing = false;
    // 队列是否已经结束
    this._stopped = false;
  }

  add(item, callback) {
    if (this._stopped) {
      return callback(new Error('Queue waw stopped'));
    }

    const key = this.getKey(item);
    const entry = this._entries.get(key);

    if (entry !== undefined) {
      if (entry.state === done_state) {
        process.nextTick(() => callback(entry.error, entry.result));
      } else if (entry.callbacks === undefined) {
        entry.callbacks = [callback];
      } else {
        entry.callbacks.push(callback);
      }
      return;
    }

    const newEntry = new AsyncQueueEntry(item, callback);
    this._entries.set(key, newEntry);
    this._queued.enqueue(newEntry);

    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing.bind(this));
    }
  }

  _ensureProcessing() {
    while (this._activeTask < this.parallelism) {
      const entry = this._queued.dequeue();

      if (entry === undefined) {
        break;
      }

      this._activeTask++;
      entry.state = processing_state;
      this._startProcess(entry);
    }
    this._willEnsureProcessing = false;
  }

  _startProcess(entry) {
    this.processor(entry.item, (error, result) => {
      if (error) {
        this._handleResult(
          entry,
          new Error(
            `AsyncQueue: ${this.name} processor failed: ${error.message}`
          )
        );
      }
      this._handleResult(entry, error, result);
    });
  }

  _handleResult(entry, error, result) {
    const callback = entry.callback;
    const callbacks = entry.callbacks;

    entry.state = done_state;
    entry.callback = undefined;
    entry.result = result;
    entry.error = error;
    this._activeTask--;
    callback(error, result);

    if (callbacks !== undefined) {
      for (const callback of callbacks) {
        callback(error, result);
      }
    }

    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing.bind(this));
    }
  }
}

module.exports = AsyncQueue;
