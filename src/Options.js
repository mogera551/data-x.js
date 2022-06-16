export default class Options {
  static spaPath;
  static spaCssPath;
  static spaHtmlPath;
  static spaModulePath;
  static filterPath = null;
  static localFilter = false;
  static modulePath = ".";
  static blockPrifix = "block";
  static setOptions(basename, options) {
    this.spaPath = options.spaPath ?? (basename ? `${basename}-spa` : "spa");
    this.spaCssPath = options.spaCssPath ?? `${this.spaPath}/css`;
    this.spaHtmlPath = options.spaHtmlPath ?? `${this.spaPath}/html`;
    this.spaModulePath = options.spaModulePath ?? `${this.spaPath}/module`;
    this.modulePath = options.modulePath ?? this.modulePath;
    this.localFilter = options.localFilter ?? this.localFilter;
    this.filterPath = this.localFilter ? (options.filterPath ?? `${this.spaPath}/module/filter`) : this.filterPath;
    this.blockPrifix = options.blockPrifix ?? this.blockPrifix;
  }

}