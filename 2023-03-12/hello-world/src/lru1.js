class HashMap {
  constructor(capacity) {
    this.size = 0;
    this.capacity = capacity || 769;
    this.data = new Array(this.capacity).fill(0).map(() => new Array());
  }
  hash(key) {
    return key % this.capacity;
  }
  put(key, value) {
    const hash = this.hash(key);
    for (let item of this.data[hash]) {
      if (item[0] === key) {
        item[1] = value;
        return;
      }
    }
    this.size++;
    this.data[hash].push([key, value]);
  }
  get(key) {
    const hash = this.hash(key);
    for (let item of this.data[hash]) {
      if (item[0] === key) {
        return item[1];
      }
    }
    return null;
  }
  remove(key) {
    const hash = this.hash(key);
    const index = this.data[hash].findIndex((item) => item[0] === key);
    if (index !== -1) {
      this.size--;
      this.data[hash].splice(index, 1);
      return true;
    }
    return false;
  }
}
class Node {
  next;
  prev;
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}
class LRUCache {
  constructor(capacity) {
    this.size = 0;
    this.capacity = capacity;
    this.hashMap = new HashMap();
    this.dummyHead = new Node();
    this.dummyTail = new Node();
    this.dummyHead.next = this.dummyTail;
    this.dummyTail.prev = this.dummyHead;
  }
  addToHead(node) {
    node.prev = this.dummyHead;
    node.next = this.dummyHead.next;
    this.dummyHead.next.prev = node;
    this.dummyHead.next = node;
  }
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  removeTail() {
    const result = this.dummyTail.prev;
    this.removeNode(result);
    return result;
  }
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  get(key) {
    const node = this.hashMap.get(key);
    if (node == null) {
      return -1;
    }
    this.moveToHead(node);
    return node.value;
  }
  put(key, value) {
    const node = this.hashMap.get(key);
    if (node == null) {
      const newNode = new Node(key, value);
      this.hashMap.put(key, newNode);
      this.addToHead(newNode);
      this.size++;
      if (this.size > this.capacity) {
        const tail = this.removeTail();
        this.hashMap.remove(tail.key);
        this.size--;
      }
    } else {
      node.value = value;
      this.moveToHead(node);
    }
  }
}

const lru = new LRUCache(2);

[[1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]].forEach((item) => {
  if (item.length == 1) {
    eval(`console.log(lru.get(${item[0]}))`);
  } else {
    eval(`lru.put(${item[0]},${item[1]})`);
  }
});
