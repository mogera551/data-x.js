export default class Options {
  static spaPath;
  static spaCssPath;
  static spaHtmlPath;
  static spaModulePath;
  static filterPath;
  static localFilter;
  static modulePath = ".";
  static setOptions(basename, options) {
    this.spaPath = options.spaPath ?? (basename ? `${basename}-spa` : "spa");
    this.spaCssPath = `${this.spaPath}/css`;
    this.spaHtmlPath = `${this.spaPath}/html`;
    this.spaModulePath = `${this.spaPath}/module`;
    this.modulePath = options.modulePath ?? ".";
    this.localFilter = options.localFilter ?? false;
    this.filterPath = this.localFilter ? (options.filterPath ?? `${this.spaPath}/module/filter`) : null;
  }

}