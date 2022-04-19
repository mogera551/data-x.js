import Root from "./Block/Root.js"

export default class App {
  static root;
  static options;
  static async boot(options = {}) {
    this.options = this.getOptions(options);
    this.root = new Root(this);
    this.root.build();
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
    const baseName = this.getBaseName();

    options.spaPath = options.spaPath ?? `${baseName}-spa`;
    return options;
  }
}