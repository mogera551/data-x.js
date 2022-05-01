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
    const promises = [];
    for(const block of this.#blocks) {
      promises.push(block.notifyAll(pattern, indexes, fromBlock));
    }
    await Promise.all(promises);
  }

}