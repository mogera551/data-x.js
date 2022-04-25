import container from "./Container.js"

const QUERY_BLOCK = "[data-x\\:block]";
const DATASET_BLOCK = "x:block";

export default class BlockBuilder {
  static collect(rootElement) {
    return Array.from(rootElement.querySelectorAll(QUERY_BLOCK));
  }

  static async createBlock(element) {
    const blockName = element.dataset[DATASET_BLOCK];
    const block = container.block;
    await block.load(blockName, element);
    await block.build();
    return block;
  }

  static async build(rootElement) {
    return await Promise.all(this.collect(rootElement).map(element => this.createBlock(element)));
  }
}