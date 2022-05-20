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
    return this.#cache.get(name);
  }

  set(name, value) {
    this.#cache.set(name, value);
    (value instanceof Promise) && value.then(v => this.#cache.set(name, v));
    return value;
  }

  delete(name) {
    this.#cache.delete(name);
  }
}