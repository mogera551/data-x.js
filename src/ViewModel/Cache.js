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
    return this.#cache.get(name);
  }

  set(name, value) {
    //console.log("set", name, value);
    this.#cache.set(name, value);
    return value;
  }

  delete(name) {
    this.#cache.delete(name);
  }
}