import container from "./Container.js"

const QUERY_BLOCK = "[data-x\\:block]";
const DATASET_BLOCK = "x:block";
const DATASET_WITH_BIND_CSS = "x:withBindCss"; // notice: camel case

export default class BlockBuilder {
  static collect(rootElement) {
    return Array.from(rootElement.querySelectorAll(QUERY_BLOCK));
  }

  static async createBlock(element) {
    const blockName = element.dataset[DATASET_BLOCK];
    const withBindCss = DATASET_WITH_BIND_CSS in element.dataset;
    const block = container.block;
    await block.load(blockName, element, withBindCss);
    await block.build();
    return block;
  }

  static async build(rootElement) {
    return await Promise.all(this.collect(rootElement).map(element => this.createBlock(element)));
  }
}