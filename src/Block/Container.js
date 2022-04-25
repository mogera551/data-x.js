import Container from "../Container/Container.js"
import BlockLoader from "../Block/BlockLoader.js";
import Block from "../Block/Block.js";

class BlockContainer extends Container {
  registData = [
    ["blockLoader", BlockLoader, "options"],
    ["block", Block, "data"],
  ];
}

const blockContainer = BlockContainer.registAll(new BlockContainer());
export default blockContainer;
