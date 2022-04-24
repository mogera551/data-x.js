import Root from "./Block/Root.js"

export default class App {
  static root;
  static options;
  static filter;
  static async boot(options = {}) {
    this.options = this.getOptions(options);
    this.filter = await this.getFilter();

    this.root = new Root(this);
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

  static getOptions(options) {
    /**
     * spaPath
     * localFilter
     * filterPath
     */
    const baseName = this.getBaseName();
    options.spaPath = options.spaPath ?? `${baseName}-spa`;
    options.filterPath = options.localFilter ? (options.filterPath ?? `${options.spaPath}/module/filter`) : null;
    return options;
  }

  static async getFilter() {
    const module = await import("./Filter/Filter.js");
    return module.default;
  }
}