class Scheduler {
  constructor(parallelism) {
    this.queue = [];
    this.runningTask = 0;
    this.parallelism = parallelism;
  }

  add(task, callback) {
    return new Promise((resolve, reject) => {
      const taskItem = {
        reject,
        resolve,
        callback,
        processor: () => Promise.resolve().then(() => task()),
      };

      this.queue.push(taskItem);
      this.scheduler();
    });
  }

  scheduler() {
    while (this.runningTask < this.parallelism && this.queue.length) {
      this.runningTask++;
      const taskItem = this.queue.shift();
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

const scheduler = new Scheduler(3);

function request(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(timeout);
    }, timeout);
  });
}

function addTask(timeout) {
  scheduler.add(
    () => request(timeout),
    (error, result) => {
      console.log("result", result);

      if (result === 3000) {
        console.timeEnd("timer");
      }
    }
  );
}

console.time("timer");
addTask(1000);
addTask(2000);
addTask(3000);
addTask(4000);
