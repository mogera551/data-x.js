import container from "./Container.js"
import BlockBuilder from "../Block/BlockBuilder.js";

export default class Root {
  #blocks = [];
  #app;
  constructor(app) {
    this.#app = app;
    const Container = container.constructor;
    Container.regist(container, "options", this.#app.options);
    Container.regist(container, "data", this.#app.data);
  }
  
  async build() {
    this.#blocks.push(...await BlockBuilder.build(document.body));
  }

  async notifyAll(pattern, indexes, fromBlock) {
    for(const block of this.#blocks) {
      block.notifyAll(pattern, indexes, fromBlock);
    }
  }

  async inquiryAll(message, param1, param2, fromBlock) {
    for(const block of this.#blocks) {
      block.inquiryAll(message, param1, param2, fromBlock);
    }
  }

}