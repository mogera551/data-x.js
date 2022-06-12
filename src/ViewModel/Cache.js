export default class Cache {
  #cache = new Map;
  #context;
  constructor(context) {
    this.#context = context;
  }

  has(name) {
    return this.#cache.has(name);
  }

  get(name) {
//    console.log("cache.get = ", name);
    return this.#cache.get(name);
  }

  set(name, value) {
//    console.log("cache.set = ", name);
    const setCache = value => {
      if (typeof value === "object" && value !== null && "__notifiable" in value) {
        value.__name = name;
      }
      this.#cache.set(name, value);
    }
    setCache(value);
    (value instanceof Promise) && value.then(v => setCache(v));
    return value;
  }

  delete(name) {
//    console.log("cache.delete = ", name);
    this.#cache.delete(name);
    const match = `${name}.`;
    Array.from(this.#cache.keys()).filter(key => key.startsWith(match)).forEach(key => this.#cache.delete(key));
  }
}