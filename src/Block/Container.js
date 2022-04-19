import Container from "../Container/Container.js"
import BlockLoader from "../Block/BlockLoader.js";

class BlockContainer extends Container {
  registData = [
    ["blockLoader", BlockLoader, "options"],
  ];
}

const blockContainer = BlockContainer.registAll(new BlockContainer());
export default blockContainer;
