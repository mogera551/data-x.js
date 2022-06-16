import Root from "./Block/Root.js"
import ModuleRoot from "./Block/ModuleRoot.js"
import Options from "./Options.js"
import Data from "./Data.js"
import Filter from "./Filter/Filter.js";
import saveRoot from "./Root.js"
import { Block } from "./Block/Block.js"
import sym from "./Symbols.js"
import Modules from "./Modules.js"

export default class App {
  static root;
  static booting = false;
  static booted = false;
  static _data = {};
  static _options = {};
  static _modules = {};
  static async boot({ data = this._data, options = this._options, modules = this._modules } = {}) {
    this.booting = true;
    try {
      Data.setData(data);
      Options.setOptions(this.getBaseName(), options);
      Modules.setModules(modules);
      await Filter.registLocalFilter();
  
      this.root = new Root();
      saveRoot.setRoot(this.root);
      await this.root.build();
    } finally {
      this.booting = false;
      this.booted = true;
    }
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

  static async createBlockModule(nameOrModuleData, { 
    alias = null, data = {}, path = null, handler = null, parentElement = null 
  }) {
    const rootBlock = new ModuleRoot(data, handler);
    const useModule = true;
    const blockData = { useModule, rootBlock };
    if ((typeof nameOrModuleData) === "object" && nameOrModuleData !== null) {
      blockData.moduleData = nameOrModuleData;
      blockData.name = alias ?? "__blockModule";
    } else if (nameOrModuleData[0] === "." || nameOrModuleData[0] === "/") {
      blockData.path = nameOrModuleData;
      blockData.name = alias ?? "__blockModule";
    } else {
      blockData.name = nameOrModuleData;
    }
    blockData.parentElement = parentElement;
    return Block.create(blockData);
  }

  static getSymbol(name) {
    return sym[name];
  }

  static data(data) {
    Object.assign(this._data, data);
    return this;
  }

  static options(options) {
    Object.assign(this._options, options);
    return this;
  }

  static modules(modules) {
    Object.assign(this._modules, modules);
    return this;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (!App.booted && !App.booting) {
    App.boot();
  }
});
