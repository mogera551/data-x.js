import container from "./Container.js"
import BlockBuilder from "../Block/BlockBuilder.js";

const Container = container.constructor;
export default class Root {
  #blocks = [];
  #app;
  constructor(app) {
    this.#app = app;
    Container.regist(container, "options", this.#app.options);
  }
  
  async build() {
    this.#blocks.push(...await BlockBuilder.build(document.body));
  }
}