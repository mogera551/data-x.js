import Block from "./Block.js"

const QUERY_BLOCK = "[data-x\\:block]";
const DATASET_BLOCK = "x:block";

export default class BlockBuilder {
  static collect(rootElement) {
    return Array.from(rootElement.querySelectorAll(QUERY_BLOCK));
  }

  static async createBlock(element) {
    const name = element.dataset[DATASET_BLOCK];
    const block = new Block(name, element);
    await block.load();
    await block.build();
    return block;
  }

  static async build(rootElement, blocks = []) {
    blocks.push(...this.collect(rootElement).map(async element => await this.createBlock(element)));
    return blocks;
  }
}