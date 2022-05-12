import Root from "./Block/Root.js"
import Options from "./Options.js"
import Data from "./Data.js"
import Filter from "./Filter/Filter.js";
import saveRoot from "./Root.js"

export default class App {
  static root;
  static async boot(data = {}, options = {}) {
    Data.setData(data);
    Options.setOptions(this.getBaseName(), options);
    await Filter.registLocalFilter();

    this.root = new Root(this);
    saveRoot.setRoot(this.root);
    await this.root.build();
  }

  static getBaseName() {
    const scriptName = location.href.split("/").pop();
    if (scriptName) {
      // delete .ext
      const names = scriptName.split(".");
      names.pop();
      return names.join(".");
    } else {
      return scriptName;
    }
  }
}