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
  get block() {
    return this.#block;
  }
  set block(value) {
    this.#block = value;
  }

  async notifyAll(pattern, indexes, fromBlock) {
    await this.#root.notifyAll(pattern, indexes, fromBlock);
    this.callback && this.callback(this.data);
  }

  async inquiryAll(message, param1, param2, fromBlock) {
    await this.#root.inquiryAll(message, param1, param2, fromBlock);
  }
}
