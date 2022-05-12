export default class Options {
  static spaPath;
  static filterPath;
  static localFilter;
  static setOptions(basename, options) {
    this.spaPath = options.spaPath ?? `${basename}-spa`;
    this.localFilter = options.localFilter ?? false;
    this.filterPath = this.localFilter ? (options.filterPath ?? `${this.spaPath}/module/filter`) : null;
  }

}