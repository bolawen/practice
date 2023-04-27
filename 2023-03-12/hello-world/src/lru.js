class LRUCache {
  constructor(max) {
    this.max = max;
    this.keys = [];
    this.size = 0;
    this.cache = Object.create(null);
  }
  remove(key) {
    const { length } = this.keys;
    if (length) {
      if (key === this.keys[length - 1]) {
        this.keys.length = length - 1;
        return;
      }
      const index = this.keys.indexOf(key);
      if (index !== -1) {
        return this.keys.splice(index, 1);
      }
    }
  }
  moveToHead(key) {
    this.remove(key);
    this.keys.unshift(key);
  }
  get(key) {
    const cache = this.cache[key];
    if (!cache) {
      return {};
    }
    this.moveToHead(key);
    return cache;
  }
  put(key, value) {
    const cache = this.cache[key];
    if (!cache) {
      const newCache = {
        key,
        value,
      };
      this.cache[key] = newCache;
      this.moveToHead(key);
      this.size++;
      if (this.size > this.max) {
        const tailKey = this.keys.pop();
        this.cache[tailKey] = null;
        this.size--;
      }
    } else {
      cache.value = value;
      this.moveToHead(key);
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
