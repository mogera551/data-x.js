import Container from "../Container/Container.js"
import BlockLoader from "../Block/BlockLoader.js";

class BlockContainer extends Container {
  registData = [
    ["blockLoader", BlockLoader, "option"],
  ];
}

const blockContainer = BlockContainer.registAll(new BlockContainer());
export default blockContainer;
