class MaxHeap {
  constructor() {
    this.data = [];
  }

  compare(a, b) {
    return a - b;
  }

  /**
   * @description: 向小顶堆中添加元素
   * @param {*} value
   */
  push(value) {
    const index = this.data.length;
    this.data.push(value);
    this.shiftUp(this.data, index);
  }

  /**
   * @description: 通过 data 数组构建小顶堆
   * @param {*} data
   */
  build(data) {
    this.data = [...data];
    const halfLength = this.data.length >>> 1;
    for (let i = halfLength - 1; i >= 0; i--) {
      this.shiftDown(this.data, i, this.data.length);
    }
    return this.data;
  }

  pop() {
    if (this.data.length === 0) {
      return null;
    }
    const first = this.data[0];
    const last = this.data.pop();
    if (first !== last) {
      this.data[0] = last;
      this.shiftDown(this.data, 0, this.data.length);
    }
    return first;
  }

  peek() {
    return this.data.length === 0 ? null : this.data[0];
  }

  /**
   * @description: 小顶堆排序  ---  从大到小
   */
  sort() {
    let data = [...this.data];
    // 1. 通过 data 数组构建小顶堆
    data = this.build(data);
    // 2. 从最后一个元素开始, 依次与堆顶元素进行交换, 然后重新调整堆
    for (let i = data.length - 1; i > 0; i--) {
      [data[0], data[i]] = [data[i], data[0]];
      this.shiftDown(data, 0, i);
    }
    return data;
  }

  shiftUp(data, startIndex) {
    let i = startIndex;
    while (i > 0) {
      const parentIndex = (i - 1) >>> 1;
      const parent = data[parentIndex];

      if (this.compare(parent, data[i]) < 0) {
        [data[i], data[parentIndex]] = [data[parentIndex], data[i]];
        i = parentIndex;
      } else {
        return;
      }
    }
  }

  shiftDown(data, startIndex, endIndex) {
    let i = startIndex;
    const halfLength = endIndex >>> 1;

    while (i < halfLength) {
      const leftIndex = (i + 1) * 2 - 1;
      const left = data[leftIndex];
      const rightIndex = leftIndex + 1;
      const right = data[rightIndex];

      if (this.compare(left, data[i]) > 0) {
        if (rightIndex < endIndex && this.compare(right, left) > 0) {
          [data[i], data[rightIndex]] = [data[rightIndex], data[i]];
          i = rightIndex;
        } else {
          [data[i], data[leftIndex]] = [data[leftIndex], data[i]];
          i = leftIndex;
        }
      } else if (rightIndex < endIndex && this.compare(right, data[i]) > 0) {
        [data[i], data[rightIndex]] = [data[rightIndex], data[i]];
        i = rightIndex;
      } else {
        return;
      }
    }
  }
}

const heap = new MaxHeap();
const array = [1, 3, 6, 10, 8, 12, 7, 4, 5, 9, 2];
array.forEach(item => {
  heap.push(item);
});
console.log('heap.data', heap.data);
array.forEach(() => {
  console.log(heap.pop());
});

heap.build([1, 3, 6, 10, 8, 12, 7, 4, 5, 9, 2]);
console.log(heap.data);
console.log(heap.sort());
