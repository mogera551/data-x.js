export default class Cache {
  #cache = new Map;
  #context;
  constructor(context) {
    this.#context = context;
  }

  has(name) {
    //console.log("has", name);
    return this.#cache.has(name);
  }

  get(name) {
    //console.log("get", name);
    const result = this.#cache.get(name);
    console.log("cache.get = ", name, result);
    return result;
  }

  set(name, value) {
    //console.log("set", name, value);
    if (value instanceof Promise) {
      this.#cache.set(name, value);
      value.then(v => this.#cache.set(name, v));
    } else {
      this.#cache.set(name, value);
    }
    return value;
  }

  delete(name) {
    this.#cache.delete(name);
  }
}