class MaxHeap {
  constructor() {
    this.data = [];
  }

  compare(a, b) {
    return a - b;
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

  push(value) {
    const index = this.data.length;
    this.data.push(value);
    this.shiftUp(this.data, index);
  }

  peek() {
    return this.data.length === 0 ? null : this.data[this.data.length - 1];
  }

  build(data) {
    this.data = [...data];
    const halfLength = this.data.length >>> 1;

    for (i = halfLength - 1; i >= 0; i--) {
      this.shiftDown(this.data, i, this.data.length);
    }

    return this.data;
  }

  sort() {
    let data = [...this.data];
    data = this.build(data);

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
        [data[parentIndex], data[i]] = [data[i], data[parentIndex]];
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
      const leftIndex = 2 * i + 1;
      const rightIndex = leftIndex + 1;
      const left = data[leftIndex];
      const right = data[rightIndex];

      if (this.compare(data[i], left) < 0) {
        if (rightIndex < endIndex && this.compare(left, right) < 0) {
          [data[i], data[rightIndex]] = [data[rightIndex], data[i]];
          i = rightIndex;
        } else {
          [data[i], data[leftIndex]] = [data[leftIndex], data[i]];
          i = leftIndex;
        }
      } else if (rightIndex < endIndex && this.compare(data[i], right) < 0) {
        [data[i], data[rightIndex]] = [data[rightIndex], data[i]];
        i = rightIndex;
      } else {
        return;
      }
    }
  }
}

function heapSort(array) {
  buildHeap(array);

  for (let i = array.length - 1; i > 0; i--) {
    [data[0], data[i]] = [data[i], data[0]];
    shiftDown(array, 0, i);
  }
}

function buildHeap(array) {
  const halfLength = array.length >>> 1;

  for (let i = halfLength - 1; i >= 0; i--) {
    shiftDown(array, 0, i);
  }
}

function compare() {}

function shiftDown(array, startIndex, endIndex) {
  let i = startIndex;
  let halfLength = endIndex >>> 1;

  while (i < halfLength) {
    const leftIndex = 2 * i + 1;
    const rightIndex = leftIndex + 1;
    const left = array[leftIndex];
    const right = array[rightIndex];

    if (compare) {
    }
  }
}

function heapSort(array) {
  buildMaxHeap(array);

  for (let i = array.length - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    shiftDown(array, 0, i);
  }
}

function buildMaxHeap(array) {
  const halfLength = array.length >>> 1;

  for (let i = halfLength - 1; i >= 0; i--) {
    shiftDown(array, i, array.length);
  }
}

function buildHeap(array) {
  const halfLength = array.length >>> 1;

  for (let i = halfLength - 1; i >= 0; i--) {
    shiftDown(array, i, array.length);
  }
}

function buildHeap(array) {
  const halfLength = array.length >>> 1;

  for (let i = halfLength - 1; i >= 0; i--) {
    shiftDown(array, i, array.length);
  }
}

function sort(array) {
  buildHeap(array);

  for (let i = array.length - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    shiftDown(array, 0, i);
  }
}
