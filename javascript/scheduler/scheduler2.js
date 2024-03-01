class Scheduler {
    constructor(limit) {
      this.limit = limit; // 并发任务的最大限制
      this.running = 0; // 当前正在执行的任务数
      this.queue = []; // 待执行的任务队列
    }
    
    // 添加任务的函数
    add(task) {
      // 返回一个封装后的Promise
      return new Promise((resolve, reject) => {
        // 任务信息对象
        const taskItem = {
          task,
          resolve,
          reject
        };
        
        // 将任务推入队列
        this.queue.push(taskItem);
        
        // 尝试运行任务
        this.runNext();
      });
    }
    
    // 尝试运行队列中的下一个任务
    runNext() {
      // 当前运行的任务数小于限制并且队列中有待执行任务时，执行任务
      if (this.running < this.limit && this.queue.length) {
        // 取出队列中的下一个任务
        const { task, resolve, reject } = this.queue.shift();
        // 增加正在执行任务的数量
        this.running++;
  
        // 执行任务，并在任务完成后减少正在执行的任务数
        Promise.resolve()
          .then(() => task())
          .then((result) => {
            // 任务执行成功，返回结果
            resolve(result);
            this.running--;
            this.runNext(); // 尝试运行下一个任务
          })
          .catch((error) => {
            // 任务执行失败，返回错误
            reject(error);
            this.running--;
            this.runNext(); // 尝试运行下一个任务
          });
      }
    }
  }
  
  // 使用例子
  
  const timeout = (time) => new Promise((resolve) => setTimeout(() => resolve(time), time));
  
  const scheduler = new Scheduler(2); // 最多并发任务个数为2
  
  const addTask = (time, order) => {
    scheduler.add(() => timeout(time)).then(() => console.log(`Task ${order} completed`));
  };
  
  addTask(1000, '1');
  addTask(500, '2');
  addTask(300, '3');
  addTask(400, '4');