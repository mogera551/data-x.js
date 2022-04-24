import builtinList from "./Builtin/list.js"
import App from "../App.js"

class Loader {
  static async loadBuiltin(filterNames = builtinList) {
    const promises = [];
    for(const filterName of filterNames) {
      promises.push(import(`./Builtin/${filterName}.js`));
    }
    await Promise.all(promises);
  }

  static getLocalPathInfo() {
    const index = document.baseURI.lastIndexOf("/");
    const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
    const path = App.options.filterPath;
    return { base, path };
  }

  static async getLocalList(base, path) {
    if (!App.options.localFilter) return [];
    const module  = await import(`${base}${path}/list.js`);
    return module.default;
  }

  static async loadLocal(base, path, filterNames) {
    const promises = [];
    for(const filterName of filterNames) {
      promises.push(import(`${base}${path}/${filterName}.js`));
    }
    await Promise.all(promises);
  }

  static async load() {
    const { base, path } = this.getLocalPathInfo();
    const localFilterNames = await this.getLocalList(base, path);
    const promises = [];
    promises.push(Loader.loadBuiltin());
    promises.push(Loader.loadLocal(base, path, localFilterNames));
    await Promise.all(promises);
  }
}

await Loader.load();
