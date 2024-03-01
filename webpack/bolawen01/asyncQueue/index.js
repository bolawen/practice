// const AsyncQueue = require('webpack/lib/util/AsyncQueue');
const AsyncQueue = require('./core/index');

function request(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      params.number = Math.random();
      resolve(params);
    }, 2000);
  });
}

function processor(item, callback) {
  request(item).then(result => {
    callback(null, result);
  });
}

const queue = new AsyncQueue({
  processor,
  name: 'bolawen',
  parallelism: 2,
  getKey: item => item.key
});

queue.add({ key: 'item1', name: 'item1-1' }, (error, result) => {
  console.log('item1 处理后的结果', result);
});

queue.add({ key: 'item2', name: 'item2-2' }, (error, result) => {
  console.log('item2 处理后的结果', result);
});

queue.add({ key: 'item3', name: 'item3-3' }, (error, result) => {
  console.log('item3 处理后的结果', result);
});

queue.add({ key: 'item4', name: 'item4-4' }, (error, result) => {
  console.log('item4 处理后的结果', result);
});

queue.add({ key: 'item5', name: 'item5-5' }, (error, result) => {
  console.log('item5 处理后的结果', result);
});

queue.add({ key: 'item1', name: 'item1-1' }, (error, result) => {
  console.log('item1 处理后的结果', result);
});
