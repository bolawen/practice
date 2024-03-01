// queue 任务缓存队列
export const queue = new Set();
export const jobQueue = new Set();

// resolve 的 Promise 实例
const p = Promise.resolve();

// isFlushing 标志: 是否正在刷新任务队列
let isFlushing = false;

export function flushJob() {
  if (isFlushing) {
    return;
  }
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach(job => job());
  }).finally(() => {
    isFlushing = false;
  });
}

/**
 * @description: queueJob
 * @param {*} job
 * 作用: 将一个任务或副作用函数添加到缓冲队列, 并开始刷新队列
 */
export function queueJob(job) {
  queue.add(job);
  if (!isFlushing) {
    isFlushing = true;
    p.then(() => {
      try {
        queue.forEach(job => job());
      } finally {
        isFlushing = false;
        queue.clear = 0;
      }
    });
  }
}
