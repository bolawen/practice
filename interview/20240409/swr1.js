class LRU {
  constructor(capacity) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  get(key) {
    if (this.cache.has(key)) {
      const temp = this.cache.get[key];
      this.cache.delete(key);
      this.cache.set(key, temp);
      return temp;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }

    this.cache.set(key, value);
  }
}

function wrapperSWR() {
  const cache = new LRU(10);

  return async function (cacheKey, request, timeout) {
    const data = cache.get(cacheKey) || { value: null, promise: null };
    cache.set(cacheKey, data);

    if (!data.value && !data.promise) {
      data.promise = request(timeout)
        .then((res) => {
          data.value = res;
        })
        .catch((error) => {
          data.value = error;
        })
        .finally(() => {
          data.promise = null;
        });
    }

    if (data.promise && !data.value) {
      await data.promise;
    }

    return data.value;
  };
}
