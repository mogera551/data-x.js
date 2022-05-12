import { BlockBuilder } from "../Block/Block.js";

export default class Root {
  #blocks = [];
  
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