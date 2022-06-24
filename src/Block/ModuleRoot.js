import Root from "./Root.js"

export default class ModuleRoot {
  #root = new Root;
  #data;
  #callback;
  #block;
  constructor(data, callback) {
    this.#data = data;
    this.#callback = callback;
  }
  get data() {
    return this.#data;
  }
  get callback() {
    return this.#callback;
  }
  get blocks() {
    return this.#root.blocks;
  }
  get block() {
    return this.#block;
  }
  set block(value) {
    this.#block = value;
  }

  notifyAll(pattern, indexes, fromBlock) {
    this.#root.notifyAll(pattern, indexes, fromBlock);
    this.callback && this.callback(this.data);
  }

  inquiryAll(message, param1, param2, fromBlock) {
    this.#root.inquiryAll(message, param1, param2, fromBlock);
  }
}
