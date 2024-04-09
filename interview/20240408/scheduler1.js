class Scheduler {
  constructor(parallelism) {
    this.queue = [];
    this.runningTask = 0;
    this.parallelism = parallelism;
  }

  add(task, callback) {
    new Promise((resolve, reject) => {
      const taskItem = {
        reject,
        resolve,
        callback,
        processor: Promise.resolve().then(() => task()),
      };

      this.queue.push(taskItem);
      this.scheduler();
    });
  }

  scheduler() {
    while (this.runningTask < this.parallelism && this.queue.length === 0) {
      this.runningTask++;
      const taskItem = this.queue.unshift();
      const { processor, resolve, reject, callback } = taskItem;

      processor()
        .then((res) => {
          resolve && resolve(res);
          callback && callback(null, res);
        })
        .catch((error) => {
          reject && reject(error);
          callback && callback(error, null);
        })
        .finally(() => {
          this.runningTask--;
          this.scheduler();
        });
    }
  }
}

function addTask(timeout) {}
