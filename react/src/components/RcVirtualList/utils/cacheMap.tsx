class CacheMap {
  maps: Record<string, number>;

  id: number = 0;

  constructor() {
    this.maps = Object.create(null);
  }

  set(key, value) {
    this.maps[key] = value;
    this.id += 1;
  }

  get(key) {
    return this.maps[key as string];
  }
}

export default CacheMap;
