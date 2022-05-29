import { BlockBuilder } from "../Block/Block.js";
import Data from "../Data.js";

export default class Root {
  #blocks = [];
  get data() {
    return Data.data;
  }
  
  async build() {
    this.#blocks.push(...await BlockBuilder.build(document.body));
  }

  async updateProcess(callback) {
    const prepare = () => {
      const results = [];
      for(const block of this.#blocks) {
        results.push(block.prepareUpdate());
      }
      return !results.every(result => result === false);
    };
    const updateDom = () => {
      const promises = [];
      for(const block of this.#blocks) {
        promises.push(block.updateDom());
      }
      return Promise.all(promises);
    };
    const postProcess = () => {
      const promises = [];
      for(const block of this.#blocks) {
        promises.push(block.postProcess());
      }
      return Promise.all(promises);
    };
    await callback();
    do {
      if (!prepare()) break;
      await updateDom();
      await postProcess();
    } while(true);
  }

  notifyAll(pattern, indexes, fromBlock) {
//    console.log("notifyAll start ", pattern, indexes);
    for(const block of this.#blocks) {
      block.notifyAll(pattern, indexes, fromBlock);
    }
//    console.log("notifyAll terminate ", pattern, indexes);
  }

  inquiryAll(message, param1, param2, fromBlock) {
    const promises = [];
    for(const block of this.#blocks) {
      promises.push(block.inquiryAll(message, param1, param2, fromBlock));
    }
    return Promise.all(promises);
  }

}